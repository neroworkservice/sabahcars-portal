"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  calculatePrice,
  type Vehicle,
  type PriceRule,
  type Holiday,
  type OneWayFee,
  type PriceBreakdown,
} from "@/app/lib/pricing";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "draft"
  | "quoted"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled";

export type Booking = {
  id: string;
  lead_id: string | null;
  customer_id: string;
  vehicle_id: string;
  sales_id: string;
  pickup_datetime: string;
  drop_datetime: string;
  pickup_location: string;
  drop_location: string;
  is_one_way: boolean;
  days: number;
  base_rate: number;
  discount_percent: number;
  discount_amount: number;
  one_way_fee: number;
  holiday_uplift: number;
  subtotal: number;
  sst_percent: number;
  sst_amount: number;
  total_amount: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
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
};

export type PricingData = {
  vehicles: Vehicle[];
  priceRules: PriceRule[];
  holidays: Holiday[];
  oneWayFees: OneWayFee[];
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

export type CreateBookingInput = {
  lead_id?: string;
  customer_id: string;
  vehicle_id: string;
  pickup_datetime: string; // ISO string
  drop_datetime: string;   // ISO string
  pickup_location: string;
  drop_location: string;
  notes?: string;
  priceBreakdown: PriceBreakdown;
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

// ─── 1. GET PRICING DATA ──────────────────────────────────────────────────────
// Fetch all reference data needed for price calculation.
// Only returns vehicles with status = "available".

export async function getPricingData(): Promise<
  { data: PricingData } | { error: string }
> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const [vehiclesRes, rulesRes, holidaysRes, feesRes] = await Promise.all([
    serviceClient
      .from("vehicles")
      .select(
        "id, name, model, group_type, seats, luggage, transmission, base_rate, status, owner_type, branch"
      )
      .eq("status", "available")
      .order("name"),
    serviceClient
      .from("price_rules")
      .select("id, min_days, max_days, discount_percent, label")
      .order("min_days"),
    serviceClient
      .from("holidays")
      .select("id, name, date, uplift_percent")
      .order("date"),
    serviceClient
      .from("one_way_fees")
      .select("id, from_location, to_location, fee"),
  ]);

  if (vehiclesRes.error) return { error: vehiclesRes.error.message };
  if (rulesRes.error) return { error: rulesRes.error.message };
  if (holidaysRes.error) return { error: holidaysRes.error.message };
  if (feesRes.error) return { error: feesRes.error.message };

  return {
    data: {
      vehicles: (vehiclesRes.data ?? []) as Vehicle[],
      priceRules: (rulesRes.data ?? []) as PriceRule[],
      holidays: (holidaysRes.data ?? []) as Holiday[],
      oneWayFees: (feesRes.data ?? []) as OneWayFee[],
    },
  };
}

// ─── 2. CALCULATE QUOTE ───────────────────────────────────────────────────────
// Validates input, fetches pricing data, and runs calculatePrice() server-side.

export async function calculateQuote(
  formData: FormData
): Promise<{ breakdown: PriceBreakdown } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const vehicle_id = formData.get("vehicle_id") as string;
  const pickup_datetime = formData.get("pickup_datetime") as string;
  const drop_datetime = formData.get("drop_datetime") as string;
  const pickup_location = formData.get("pickup_location") as string;
  const drop_location = formData.get("drop_location") as string;

  if (
    !vehicle_id ||
    !pickup_datetime ||
    !drop_datetime ||
    !pickup_location ||
    !drop_location
  ) {
    return { error: "Semua maklumat diperlukan untuk mengira sebut harga." };
  }

  const pickupDatetime = new Date(pickup_datetime);
  const dropDatetime = new Date(drop_datetime);

  if (isNaN(pickupDatetime.getTime()) || isNaN(dropDatetime.getTime())) {
    return { error: "Format tarikh tidak sah." };
  }

  if (dropDatetime <= pickupDatetime) {
    return { error: "Tarikh pulang mesti selepas tarikh ambil." };
  }

  const pricingResult = await getPricingData();
  if ("error" in pricingResult) return { error: pricingResult.error };

  const { vehicles, priceRules, holidays, oneWayFees } = pricingResult.data;

  const vehicle = vehicles.find((v) => v.id === vehicle_id);
  if (!vehicle) {
    return { error: "Kenderaan tidak dijumpai atau tidak tersedia." };
  }

  const breakdown = calculatePrice({
    vehicle,
    pickupDatetime,
    dropDatetime,
    pickupLocation: pickup_location,
    dropLocation: drop_location,
    priceRules,
    holidays,
    oneWayFees,
  });

  return { breakdown };
}

// ─── 3. CREATE BOOKING ────────────────────────────────────────────────────────
// Inserts a booking record using a pre-calculated PriceBreakdown.
// Allowed roles: admin, sales, agent.

export async function createBooking(
  input: CreateBookingInput
): Promise<{ success: true; booking_id: string } | { error: string }> {
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

  if (!["admin", "sales", "agent"].includes(userData.role)) {
    return { error: "Anda tidak dibenarkan membuat tempahan." };
  }

  const {
    lead_id,
    customer_id,
    vehicle_id,
    pickup_datetime,
    drop_datetime,
    pickup_location,
    drop_location,
    notes,
    priceBreakdown: pb,
  } = input;

  const { data: booking, error: bookingError } = await serviceClient
    .from("bookings")
    .insert({
      lead_id: lead_id || null,
      customer_id,
      vehicle_id,
      sales_id: user.id,
      pickup_datetime,
      drop_datetime,
      pickup_location,
      drop_location,
      is_one_way: pb.isOneWay,
      days: pb.days,
      base_rate: pb.baseRate,
      discount_percent: pb.discountPercent,
      discount_amount: pb.discountAmount,
      one_way_fee: pb.oneWayFee,
      holiday_uplift: pb.holidayUplift,
      subtotal: pb.subtotal,
      sst_percent: pb.sstPercent,
      sst_amount: pb.sstAmount,
      total_amount: pb.totalAmount,
      status: "draft",
      notes: notes || null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return { error: bookingError?.message || "Gagal cipta tempahan." };
  }

  return { success: true, booking_id: booking.id };
}

// ─── 4. GET BOOKINGS ──────────────────────────────────────────────────────────
// Admin → all bookings
// Sales / Agent → only their own bookings (sales_id = current user)

export async function getBookings(): Promise<
  { bookings: Booking[] } | { error: string }
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

  let query = serviceClient
    .from("bookings")
    .select(
      `
      id,
      lead_id,
      customer_id,
      vehicle_id,
      sales_id,
      pickup_datetime,
      drop_datetime,
      pickup_location,
      drop_location,
      is_one_way,
      days,
      base_rate,
      discount_percent,
      discount_amount,
      one_way_fee,
      holiday_uplift,
      subtotal,
      sst_percent,
      sst_amount,
      total_amount,
      status,
      notes,
      created_at,
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
    `
    )
    .order("created_at", { ascending: false });

  // Scope to own bookings for non-admin roles
  if (userData.role === "sales" || userData.role === "agent") {
    query = query.eq("sales_id", user.id);
  }

  const { data: bookings, error: bookingsError } = await query;

  if (bookingsError) return { error: bookingsError.message };

  // Normalize Supabase join result (same pattern as leads.ts)
  const mapped: Booking[] = (bookings ?? []).map((row) => {
    const raw = row as unknown as Omit<Booking, "customers" | "vehicles"> & {
      customers:
        | { id: string; name: string; phone: string | null; email: string | null }[]
        | { id: string; name: string; phone: string | null; email: string | null }
        | null;
      vehicles:
        | { id: string; name: string; model: string; group_type: string }[]
        | { id: string; name: string; model: string; group_type: string }
        | null;
    };
    return {
      ...raw,
      customers: Array.isArray(raw.customers)
        ? (raw.customers[0] ?? null)
        : raw.customers,
      vehicles: Array.isArray(raw.vehicles)
        ? (raw.vehicles[0] ?? null)
        : raw.vehicles,
    };
  });

  return { bookings: mapped };
}

// ─── 5. GET CUSTOMERS ─────────────────────────────────────────────────────────
// Fetch all customers for the quote form dropdown.

export async function getCustomers(): Promise<
  { customers: Customer[] } | { error: string }
> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { data, error } = await serviceClient
    .from("customers")
    .select("id, name, phone, email")
    .order("name");

  if (error) return { error: error.message };

  return { customers: (data ?? []) as Customer[] };
}
