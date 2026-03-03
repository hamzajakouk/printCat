import { NextRequest, NextResponse } from "next/server";

// Vercel: allow up to 60 s (Pro) / 10 s (Hobby) before the platform cuts us off.
// The POST only creates the prediction and returns immediately, so even 10 s is
// plenty — but setting this explicitly documents the intent and future-proofs for
// models that take longer to accept inputs.
export const maxDuration = 60;

// ── Model ─────────────────────────────────────────────────────────────────────
// Using the /v1/models/.../predictions endpoint so no version hash is required —
// Replicate will always run the latest published version of the model.
const REPLICATE_MODEL = "black-forest-labs/flux-dev";

// ── Prompt ────────────────────────────────────────────────────────────────────
const PROMPT =
  "oil painting portrait of a noble pet animal wearing a royal velvet collar " +
  "with gold trim, Italian Renaissance master style, Raphael, chiaroscuro " +
  "lighting, warm rich earth tones, intricate detailed fur, dramatic dark " +
  "background, museum quality, oil on canvas texture";

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
          // prompt_strength: how much the style prompt overrides the source image.
          // 0 = keep original, 1 = ignore original. 0.75 gives strong style
          // transfer while keeping the pet's face recognisable.
          prompt_strength: 0.5,
          num_inference_steps: 28,
          guidance: 3.5,
          aspect_ratio: "4:5", // portrait — matches the 8×10 print ratio
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
