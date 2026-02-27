import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { type BookingStatus } from "@/app/actions/bookings";
import ConfirmButton from "./_components/ConfirmButton";

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  draft: { label: "Draf", color: "bg-gray-100 text-gray-600" },
  quoted: { label: "Sebut Harga", color: "bg-blue-100 text-blue-600" },
  confirmed: { label: "Disahkan", color: "bg-green-100 text-green-600" },
  ongoing: { label: "Sedang Berjalan", color: "bg-orange-100 text-orange-600" },
  completed: { label: "Selesai", color: "bg-teal-100 text-teal-600" },
  cancelled: { label: "Dibatal", color: "bg-red-100 text-red-600" },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

type QuoteBooking = {
  id: string;
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
  sst_amount: number;
  total_amount: number;
  status: BookingStatus;
  notes: string | null;
  vehicles: {
    name: string;
    model: string;
    group_type: string;
  } | null;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default async function CustomerQuotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set("connection", "close");
    return fetch(url, { ...init, headers });
  };

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: customFetch } }
  );

  const { data: userData } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "customer")
    redirect(`/dashboard/${userData?.role ?? "customer"}`);

  // Collect all customer records linked to this auth email
  const { data: customerRecords } = await serviceClient
    .from("customers")
    .select("id")
    .eq("email", user.email!);

  const customerIds = (customerRecords ?? []).map((r) => r.id);

  let quotes: QuoteBooking[] = [];
  let fetchError: string | null = null;

  if (customerIds.length > 0) {
    const { data, error } = await serviceClient
      .from("bookings")
      .select(
        `
        id,
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
        sst_amount,
        total_amount,
        status,
        notes,
        vehicles (
          name,
          model,
          group_type
        )
      `
      )
      .in("customer_id", customerIds)
      .in("status", ["draft", "quoted", "confirmed"])
      .order("created_at", { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      quotes = (data ?? []).map((row) => {
        const raw = row as typeof row & {
          vehicles:
            | { name: string; model: string; group_type: string }[]
            | { name: string; model: string; group_type: string }
            | null;
        };
        return {
          ...raw,
          status: raw.status as BookingStatus,
          vehicles: Array.isArray(raw.vehicles)
            ? (raw.vehicles[0] ?? null)
            : raw.vehicles,
        };
      });
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sebut Harga Saya</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Quote yang telah disediakan oleh pasukan jualan untuk anda
          </p>
        </div>
        {quotes.length > 0 && (
          <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl border border-blue-100">
            {quotes.length} Quote
          </span>
        )}
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
          Ralat: {fetchError}
        </div>
      )}

      {/* Empty — no customer record or no quotes */}
      {quotes.length === 0 && !fetchError && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <p className="text-gray-400 text-sm italic mb-2">
            Tiada quote menunggu pada masa ini.
          </p>
          <p className="text-gray-400 text-xs">
            Hantar inquiry terlebih dahulu dan pasukan jualan kami akan
            menyediakan sebut harga untuk anda.
          </p>
        </div>
      )}

      {/* Quote cards */}
      {quotes.length > 0 && (
        <div className="space-y-4">
          {quotes.map((quote) => {
            const badge = statusConfig[quote.status] ?? statusConfig.quoted;
            return (
              <div
                key={quote.id}
                className="bg-white rounded-xl border border-blue-100 shadow-sm p-5"
              >
                {/* Vehicle + status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-base truncate">
                      {quote.vehicles?.name ?? "Kenderaan Tidak Diketahui"}
                    </p>
                    {quote.vehicles?.group_type && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {quote.vehicles.group_type} &middot; {quote.vehicles.model}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Dates + locations */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tarikh Ambil</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDatetime(quote.pickup_datetime)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {quote.pickup_location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tarikh Pulang</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDatetime(quote.drop_datetime)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {quote.drop_location}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {quote.days} hari
                  </span>
                  {quote.is_one_way && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      One-Way
                    </span>
                  )}
                  {quote.discount_percent > 0 && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                      Diskaun {quote.discount_percent}%
                    </span>
                  )}
                  {quote.holiday_uplift > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      Cuti Umum
                    </span>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Kadar asas ({quote.days} hari × {formatRM(quote.base_rate)})</span>
                    <span>{formatRM(quote.base_rate * quote.days)}</span>
                  </div>
                  {quote.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskaun ({quote.discount_percent}%)</span>
                      <span>− {formatRM(quote.discount_amount)}</span>
                    </div>
                  )}
                  {quote.one_way_fee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Bayaran one-way</span>
                      <span>+ {formatRM(quote.one_way_fee)}</span>
                    </div>
                  )}
                  {quote.holiday_uplift > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tambahan cuti umum</span>
                      <span>+ {formatRM(quote.holiday_uplift)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-1.5 mt-1.5">
                    <span>Subtotal</span>
                    <span>{formatRM(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>SST (8%)</span>
                    <span>+ {formatRM(quote.sst_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                    <span>Jumlah Keseluruhan</span>
                    <span className="text-base">{formatRM(quote.total_amount)}</span>
                  </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <div className="mt-3 text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                    <span className="font-medium text-yellow-700">Nota: </span>
                    {quote.notes}
                  </div>
                )}

                {/* Confirm button — only for quoted status */}
                {quote.status === "quoted" && (
                  <div className="mt-4">
                    <ConfirmButton bookingId={quote.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
