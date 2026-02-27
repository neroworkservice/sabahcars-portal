"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PaymentMethod = "cash" | "bank_transfer" | "tng" | "hitpay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  reference_no: string | null;
  notes: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
};

export type PaymentWithBooking = Payment & {
  bookings: {
    id: string;
    pickup_datetime: string;
    drop_datetime: string;
    pickup_location: string;
    drop_location: string;
    total_amount: number;
    status: string;
    customers: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
    } | null;
    vehicles: {
      id: string;
      name: string;
      model: string;
      group_type: string;
    } | null;
  } | null;
};

export type CreatePaymentInput = {
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  reference_no?: string;
  notes?: string;
};

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

// ─── 1. CREATE PAYMENT ────────────────────────────────────────────────────────
// Admin/Sales only.
// Non-hitpay methods are instantly marked "paid" with paid_at = NOW().
// When payment status = "paid", booking is updated to "ongoing".

export async function createPayment(
  input: CreatePaymentInput
): Promise<{ success: true; payment_id: string } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };

  if (!["admin", "sales"].includes(userData.role))
    return { error: "Hanya admin atau sales boleh merekod bayaran." };

  const { booking_id, amount, method, reference_no, notes } = input;

  // Non-hitpay payments are collected manually — mark as paid immediately
  const isPaid = method !== "hitpay";
  const status: PaymentStatus = isPaid ? "paid" : "pending";
  const paid_at = isPaid ? new Date().toISOString() : null;

  const { data: payment, error: paymentError } = await serviceClient
    .from("payments")
    .insert({
      booking_id,
      amount,
      method,
      reference_no: reference_no || null,
      notes: notes || null,
      status,
      paid_at,
    })
    .select("id")
    .single();

  if (paymentError || !payment)
    return { error: paymentError?.message || "Gagal rekod bayaran." };

  // Cascade: paid → booking becomes "ongoing"
  if (isPaid) {
    await serviceClient
      .from("bookings")
      .update({ status: "ongoing" })
      .eq("id", booking_id);
  }

  return { success: true, payment_id: payment.id };
}

// ─── 2. GET PAYMENTS BY BOOKING ───────────────────────────────────────────────
// Admin/Sales: any booking.
// Customer: only their own bookings (verified via email → customer_id).

export async function getPaymentsByBooking(
  booking_id: string
): Promise<{ payments: Payment[] } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };

  if (!["admin", "sales", "customer"].includes(userData.role))
    return { error: "Tidak dibenarkan melihat bayaran." };

  // Customer: ensure booking belongs to them before exposing payment data
  if (userData.role === "customer") {
    const { data: customerRecords } = await serviceClient
      .from("customers")
      .select("id")
      .eq("email", user.email!);

    const customerIds = (customerRecords ?? []).map((r) => r.id);

    if (customerIds.length === 0)
      return { error: "Rekod pelanggan tidak dijumpai." };

    const { data: booking } = await serviceClient
      .from("bookings")
      .select("id")
      .eq("id", booking_id)
      .in("customer_id", customerIds)
      .single();

    if (!booking) return { error: "Tempahan tidak dijumpai." };
  }

  const { data, error } = await serviceClient
    .from("payments")
    .select(
      "id, booking_id, amount, method, reference_no, notes, status, paid_at, created_at"
    )
    .eq("booking_id", booking_id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  return { payments: (data ?? []) as Payment[] };
}

// ─── 3. GET PAYMENTS ──────────────────────────────────────────────────────────
// Admin only. Returns all payments with nested booking → customer + vehicle.

export async function getPayments(): Promise<
  { payments: PaymentWithBooking[] } | { error: string }
> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };

  if (userData.role !== "admin")
    return { error: "Hanya admin boleh melihat semua bayaran." };

  const { data, error } = await serviceClient
    .from("payments")
    .select(
      `
      id,
      booking_id,
      amount,
      method,
      reference_no,
      notes,
      status,
      paid_at,
      created_at,
      bookings (
        id,
        pickup_datetime,
        drop_datetime,
        pickup_location,
        drop_location,
        total_amount,
        status,
        customers (
          id,
          name,
          phone,
          email
        ),
        vehicles (
          id,
          name,
          model,
          group_type
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  // Normalize nested join arrays (Supabase can return object or array for joins)
  type RawCustomer = { id: string; name: string; phone: string | null; email: string | null };
  type RawVehicle = { id: string; name: string; model: string; group_type: string };
  type RawBooking = {
    id: string;
    pickup_datetime: string;
    drop_datetime: string;
    pickup_location: string;
    drop_location: string;
    total_amount: number;
    status: string;
    customers: RawCustomer | RawCustomer[] | null;
    vehicles: RawVehicle | RawVehicle[] | null;
  };
  type RawRow = Omit<PaymentWithBooking, "bookings"> & {
    bookings: RawBooking | RawBooking[] | null;
  };

  const mapped: PaymentWithBooking[] = (data ?? []).map((row) => {
    const raw = row as unknown as RawRow;
    const booking = Array.isArray(raw.bookings)
      ? (raw.bookings[0] ?? null)
      : raw.bookings;

    return {
      ...raw,
      bookings: booking
        ? {
            ...booking,
            customers: Array.isArray(booking.customers)
              ? (booking.customers[0] ?? null)
              : booking.customers,
            vehicles: Array.isArray(booking.vehicles)
              ? (booking.vehicles[0] ?? null)
              : booking.vehicles,
          }
        : null,
    };
  });

  return { payments: mapped };
}

// ─── 5. CREATE HITPAY PAYMENT ─────────────────────────────────────────────────
// Customer only. Creates a HitPay payment request and saves a pending payment row.

export async function createHitPayPayment(
  booking_id: string
): Promise<{ success: true; payment_url: string } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };
  if (userData.role !== "customer")
    return { error: "Hanya pelanggan boleh membuat pembayaran online." };

  // Fetch booking + customer details in parallel
  const [{ data: booking, error: bookingError }, { data: customerRecords }] =
    await Promise.all([
      serviceClient
        .from("bookings")
        .select("id, total_amount, status, customer_id")
        .eq("id", booking_id)
        .single(),
      serviceClient
        .from("customers")
        .select("id, name, phone, email")
        .eq("email", user.email!),
    ]);

  if (bookingError || !booking) return { error: "Tempahan tidak dijumpai." };

  const customerIds = (customerRecords ?? []).map((r) => r.id);
  if (!customerIds.includes(booking.customer_id))
    return { error: "Anda tidak dibenarkan membayar untuk tempahan ini." };

  if (booking.status !== "confirmed")
    return { error: "Tempahan mesti disahkan sebelum boleh dibayar." };

  const customer = (customerRecords ?? []).find(
    (r) => r.id === booking.customer_id
  );
  if (!customer) return { error: "Rekod pelanggan tidak dijumpai." };

  // Call HitPay API
  const hitpayRes = await fetch(
    `${process.env.HITPAY_BASE_URL}/v1/payment-requests`,
    {
      method: "POST",
      headers: {
        "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: booking.total_amount,
        currency: "MYR",
        email: customer.email,
        name: customer.name,
        phone: customer.phone ?? undefined,
        reference_number: booking.id,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/bookings?payment=success`,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/hitpay`,
      }),
    }
  );

  if (!hitpayRes.ok) {
    const errText = await hitpayRes.text();
    return { error: `HitPay error: ${errText}` };
  }

  const hitpayData = await hitpayRes.json();

  // Save pending payment row
  const { error: insertError } = await serviceClient.from("payments").insert({
    booking_id,
    amount: booking.total_amount,
    method: "hitpay" as PaymentMethod,
    status: "pending" as PaymentStatus,
    hitpay_payment_request_id: hitpayData.id,
    notes: "HitPay online payment",
  });

  if (insertError) return { error: insertError.message };

  return { success: true, payment_url: hitpayData.url };
}

// ─── 4. UPDATE PAYMENT STATUS ─────────────────────────────────────────────────
// Admin only.
// "paid"     → set paid_at = NOW(), cascade booking → "ongoing"
// "refunded" → cascade booking → "confirmed"

export async function updatePaymentStatus(
  payment_id: string,
  status: PaymentStatus
): Promise<{ success: true } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };

  if (userData.role !== "admin")
    return { error: "Hanya admin boleh kemaskini status bayaran." };

  // Fetch payment to get booking_id for cascade
  const { data: payment, error: fetchError } = await serviceClient
    .from("payments")
    .select("id, booking_id")
    .eq("id", payment_id)
    .single();

  if (fetchError || !payment) return { error: "Bayaran tidak dijumpai." };

  const updatePayload: { status: PaymentStatus; paid_at?: string } = { status };
  if (status === "paid") {
    updatePayload.paid_at = new Date().toISOString();
  }

  const { error: updateError } = await serviceClient
    .from("payments")
    .update(updatePayload)
    .eq("id", payment_id);

  if (updateError) return { error: updateError.message };

  // Cascade booking status
  if (status === "paid") {
    await serviceClient
      .from("bookings")
      .update({ status: "ongoing" })
      .eq("id", payment.booking_id);
  } else if (status === "refunded") {
    await serviceClient
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", payment.booking_id);
  }

  return { success: true };
}
