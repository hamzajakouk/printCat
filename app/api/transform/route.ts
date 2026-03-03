import { NextRequest, NextResponse } from "next/server";

// Vercel: allow up to 60 s (Pro) / 10 s (Hobby) before the platform cuts us off.
// The POST only creates the prediction and returns immediately, so even 10 s is
// plenty — but setting this explicitly documents the intent and future-proofs for
// models that take longer to accept inputs.
export const maxDuration = 60;

// ── Model ─────────────────────────────────────────────────────────────────────
// Using the /v1/models/.../predictions endpoint so no version hash is required —
// Replicate will always run the latest published version of the model.
const REPLICATE_MODEL = "lucataco/ip-adapter-sdxl";

// ── Prompt ────────────────────────────────────────────────────────────────────
const PROMPT =
  "oil painting portrait of a noble pet animal wearing a royal velvet collar " +
  "with gold trim, Italian Renaissance master style, Raphael, chiaroscuro " +
  "lighting, warm rich earth tones, intricate detailed fur, dramatic dark " +
  "background, museum quality, oil on canvas texture";

const NEGATIVE_PROMPT =
  "cartoon, anime, modern, 3d render, digital art, blurry, low quality, " +
  "ugly, deformed, text, watermark, signature, nsfw";

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfiguration: REPLICATE_API_TOKEN is not set." },
      { status: 500 }
    );
  }

  // Parse multipart form data
  let file: File;
  try {
    const form = await req.formData();
    const candidate = form.get("image");
    if (!candidate || typeof candidate === "string") {
      return NextResponse.json(
        { error: "Request must include an `image` file field." },
        { status: 400 }
      );
    }
    file = candidate as File;
  } catch {
    return NextResponse.json(
      { error: "Could not parse form data." },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Uploaded file must be an image." },
      { status: 400 }
    );
  }

  // Convert to base64 data URI.
  // Note: for images larger than ~3 MB consider resizing client-side first.
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  // Create a Replicate prediction asynchronously.
  // Using the model-scoped endpoint means we never need a version hash.
  const [owner, modelName] = REPLICATE_MODEL.split("/");
  const replicateRes = await fetch(
    `https://api.replicate.com/v1/models/${owner}/${modelName}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Ask Replicate to respond immediately (don't block until complete)
        Prefer: "respond-async",
      },
      body: JSON.stringify({
        input: {
          image: dataUri,
          prompt: PROMPT,
          negative_prompt: NEGATIVE_PROMPT,
          // ip_adapter_scale controls how strongly the reference image guides
          // the output — 0 = ignore image, 1 = copy it exactly. 0.6 is a good
          // balance for style transfer.
          ip_adapter_scale: 0.6,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 768,
          height: 1024,
        },
      }),
    }
  );

  if (!replicateRes.ok) {
    const body = await replicateRes.text();
    console.error("[transform] Replicate create error:", body);
    return NextResponse.json(
      { error: `Replicate returned ${replicateRes.status}: ${body}` },
      { status: 502 }
    );
  }

  const prediction = (await replicateRes.json()) as {
    id: string;
    status: string;
  };

  // Return the prediction ID immediately. The client polls /api/transform/:id
  // to track progress without blocking a long-running serverless function.
  return NextResponse.json(
    { predictionId: prediction.id, status: prediction.status },
    { status: 201 }
  );
}
