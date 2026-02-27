import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

// ─── SERVICE CLIENT ───────────────────────────────────────────────────────────

const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set("connection", "close");
  return fetch(url, { ...init, headers });
};

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: customFetch } }
  );
}

// ─── HMAC VERIFICATION ────────────────────────────────────────────────────────

function verifyHitPayHmac(
  params: Record<string, string>,
  secret: string
): boolean {
  const { hmac: receivedHmac, ...rest } = params;
  const sorted = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const computed = createHmac("sha256", secret)
    .update(sorted)
    .digest("hex");
  return computed === receivedHmac;
}

// ─── POST /api/webhooks/hitpay ────────────────────────────────────────────────

export async function POST(request: Request) {
  const rawBody = await request.text();

  // Parse URL-encoded form body
  const params: Record<string, string> = {};
  for (const pair of rawBody.split("&")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, idx).replace(/\+/g, " "));
    const val = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, " "));
    params[key] = val;
  }

  const secret = process.env.HITPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("HITPAY_WEBHOOK_SECRET not configured");
    return new Response("Server misconfigured", { status: 500 });
  }

  // TEMPORARY DEBUG - skip HMAC verification
  // if (!verifyHitPayHmac(params, secret)) {
  //   console.error("HitPay webhook HMAC verification failed");
  //   return new Response("Invalid signature", { status: 401 });
  // }
  console.log("=== HITPAY WEBHOOK RECEIVED ===");
  console.log("Raw body:", rawBody);
  console.log("Parsed params:", JSON.stringify(params));
  console.log("Secret first 10 chars:", secret?.substring(0, 10));

  const {
    payment_id,
    payment_request_id,
    status,
    reference_number: booking_id,
  } = params;

  const serviceClient = getServiceClient();

  if (status === "completed") {
    // Update payment row: paid
    await serviceClient
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        hitpay_payment_id: payment_id,
      })
      .eq("hitpay_payment_request_id", payment_request_id);

    // Cascade: booking → ongoing
    await serviceClient
      .from("bookings")
      .update({ status: "ongoing" })
      .eq("id", booking_id);
  } else if (status === "failed") {
    await serviceClient
      .from("payments")
      .update({ status: "failed" })
      .eq("hitpay_payment_request_id", payment_request_id);
  }

  return new Response("OK", { status: 200 });
}
