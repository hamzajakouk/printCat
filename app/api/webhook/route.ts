import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const maxDuration = 60;

// ── Printify product IDs ──────────────────────────────────────────────────────
//
// To find the right IDs for your 8×10 framed poster:
//   1. Go to printify.com → Catalog → search "Framed Enhanced Matte Paper Poster"
//   2. Pick a print provider, open the product, find your 8×10 variant
//   3. Use the Printify API: GET /v1/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/variants.json
//
// You can override these without redeploying by setting env vars.
const BLUEPRINT_ID = Number(process.env.PRINTIFY_BLUEPRINT_ID ?? 91);   // Framed Enhanced Matte Paper Poster
const PROVIDER_ID  = Number(process.env.PRINTIFY_PROVIDER_ID  ?? 9);    // MWW On Demand
const VARIANT_ID   = Number(process.env.PRINTIFY_VARIANT_ID   ?? 45654); // 8×10, black frame

async function createPrintifyOrder(
  shopId: string,
  token: string,
  sessionId: string,
  imageUrl: string,
  customerEmail: string,
  customerDetails: Stripe.Checkout.Session["customer_details"]
) {
  const name     = customerDetails?.name ?? "";
  const spaceIdx = name.indexOf(" ");
  const firstName = spaceIdx === -1 ? name : name.slice(0, spaceIdx);
  const lastName  = spaceIdx === -1 ? ""   : name.slice(spaceIdx + 1);
  const addr      = customerDetails?.address;

  const payload = {
    // Stripe session ID as a stable, idempotent order label
    label: sessionId,
    line_items: [
      {
        blueprint_id:      BLUEPRINT_ID,
        print_provider_id: PROVIDER_ID,
        variant_id:        VARIANT_ID,
        quantity:          1,
        print_areas: {
          front: imageUrl, // "front" is the standard key for single-sided products
        },
      },
    ],
    shipping_method:           1,    // 1 = Standard, 2 = Express
    send_shipping_notification: true,
    address_to: {
      first_name: firstName || name,
      last_name:  lastName,
      email:      customerEmail,
      phone:      customerDetails?.phone   ?? "",
      country:    addr?.country            ?? "",
      region:     addr?.state              ?? "",
      address1:   addr?.line1              ?? "",
      address2:   addr?.line2              ?? "",
      city:       addr?.city               ?? "",
      zip:        addr?.postal_code        ?? "",
    },
  };

  const res = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Printify ${res.status}: ${body}`);
  }

  return res.json() as Promise<{ id: string }>;
}

// ── Webhook handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Guard: env vars ──────────────────────────────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server misconfiguration." },
      { status: 500 }
    );
  }

  // Initialise inside the handler so the module loads cleanly at build time.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // ── Read raw body ────────────────────────────────────────────────────────
  // Stripe requires the raw, unparsed body to verify the request signature.
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  // ── Verify webhook signature ─────────────────────────────────────────────
  console.log("[webhook] body.length:", body.length);
  console.log("[webhook] sig header:", signature?.slice(0, 60));
  console.log("[webhook] secret prefix:", process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 20));

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed.";
    console.error("[webhook] Invalid signature:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Handle events ────────────────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const imageUrl      = session.metadata?.imageUrl      ?? null;
    const customerEmail = session.customer_details?.email ?? "";
    const sessionId     = session.id;

    if (!imageUrl) {
      // Payment went through but metadata is missing — log and investigate,
      // but don't return an error (Stripe would retry on non-2xx responses).
      console.warn("[webhook] checkout.session.completed — imageUrl missing", {
        sessionId,
        customerEmail,
      });
    } else {
      console.log("[webhook] Payment complete", {
        sessionId,
        customerEmail,
        imageUrl,
      });

      // ── Create Printify print order ───────────────────────────────────
      const printifyToken  = process.env.PRINTIFY_API_TOKEN;
      const printifyShopId = process.env.PRINTIFY_SHOP_ID;

      if (!printifyToken || !printifyShopId) {
        console.error(
          "[webhook] Missing PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID — skipping order"
        );
      } else {
        try {
          const order = await createPrintifyOrder(
            printifyShopId,
            printifyToken,
            sessionId,
            imageUrl,
            customerEmail,
            session.customer_details
          );
          console.log("[webhook] Printify order created:", order.id);
        } catch (err) {
          // Log but do NOT return a non-2xx response — Stripe would retry the
          // webhook on failure, which could produce duplicate Printify orders.
          console.error(
            "[webhook] Printify order creation failed:",
            err instanceof Error ? err.message : err
          );
        }
      }
    }
  }

  // Always return 200 so Stripe doesn't retry for unhandled event types.
  return NextResponse.json({ received: true });
}
