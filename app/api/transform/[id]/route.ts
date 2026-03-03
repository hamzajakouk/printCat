import { NextRequest, NextResponse } from "next/server";

// Each poll is a quick Replicate fetch — 60 s is generous but explicit.
export const maxDuration = 60;

// ── Replicate prediction shape (partial) ──────────────────────────────────────
type PredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

interface ReplicatePrediction {
  id: string;
  status: PredictionStatus;
  output: string | string[] | null;
  error: string | null;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  // Next.js 15+ passes params as a Promise
  { params }: { params: Promise<{ id: string }> }
) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfiguration: REPLICATE_API_TOKEN is not set." },
      { status: 500 }
    );
  }

  const { id } = await params;

  const replicateRes = await fetch(
    `https://api.replicate.com/v1/predictions/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      // Always fetch fresh — never use a cached response
      cache: "no-store",
    }
  );

  if (!replicateRes.ok) {
    const body = await replicateRes.text();
    console.error("[transform/id] Replicate poll error:", body);
    return NextResponse.json(
      { error: `Replicate returned ${replicateRes.status}: ${body}` },
      { status: 502 }
    );
  }

  const prediction = (await replicateRes.json()) as ReplicatePrediction;

  switch (prediction.status) {
    case "succeeded": {
      // output is a URL string or an array of URL strings
      const raw = prediction.output;
      const imageUrl = Array.isArray(raw) ? raw[0] : raw;
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Prediction succeeded but returned no output." },
          { status: 502 }
        );
      }
      return NextResponse.json({ status: "succeeded", imageUrl });
    }

    case "failed":
    case "canceled":
      return NextResponse.json(
        {
          status: prediction.status,
          error: prediction.error ?? "Prediction did not complete successfully.",
        },
        { status: 502 }
      );

    // "starting" | "processing" — tell the client to keep polling
    default:
      return NextResponse.json({ status: prediction.status });
  }
}
