import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const maxDuration = 60;

// Product price in cents — override with STRIPE_PRICE_CENTS without redeploying
// Default: $49.00 (8×10 framed print)
const PRICE_CENTS = Number(process.env.STRIPE_PRICE_CENTS ?? 4900);

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  // Initialise inside the handler so the module loads cleanly at build time
  // when env vars are not yet available.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Parse body
  let imageUrl: string;
  try {
    const body = await req.json();
    imageUrl = body.imageUrl;
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Derive the site origin from the request so this works on localhost and Vercel
  const origin =
    req.headers.get("origin") ??
    `https://${req.headers.get("host")}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: {
            name: "Renaissance Pet Portrait — 8×10 Framed Print",
            description:
              "Museum-quality giclée print in a premium black frame, delivered to your door.",
            images: [imageUrl],
          },
        },
      },
    ],
    // Collect shipping address so the webhook can pass it to Printify
    shipping_address_collection: {
      allowed_countries: [
        "US", "GB", "CA", "AU",
        "DE", "FR", "NL", "BE",
        "SE", "NO", "DK", "FI",
        "IE", "AT", "CH", "IT",
        "ES", "PT",
      ],
    },
    // Store the generated image URL so the webhook can forward it to Printify
    metadata: { imageUrl },
    success_url: `${origin}/?payment=success`,
    cancel_url:  `${origin}/?payment=cancelled`,
    // Pre-fill email if we had it, but we don't here — Stripe collects it
    phone_number_collection: { enabled: true },
  });

  return NextResponse.json({ url: session.url });
}
