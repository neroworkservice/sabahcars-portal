import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { type BookingStatus } from "@/app/actions/bookings";

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

type CustomerBooking = {
  id: string;
  pickup_datetime: string;
  drop_datetime: string;
  pickup_location: string;
  drop_location: string;
  days: number;
  total_amount: number;
  status: BookingStatus;
  vehicles: {
    name: string;
    model: string;
    group_type: string;
  } | null;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default async function CustomerBookingsPage() {
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

  // Find the customers record linked to this user by email
  const { data: customerRecord } = await serviceClient
    .from("customers")
    .select("id")
    .eq("email", user.email!)
    .maybeSingle();

  let bookings: CustomerBooking[] = [];
  let fetchError: string | null = null;

  if (customerRecord?.id) {
    const { data, error } = await serviceClient
      .from("bookings")
      .select(
        `
        id,
        pickup_datetime,
        drop_datetime,
        pickup_location,
        drop_location,
        days,
        total_amount,
        status,
        vehicles (
          name,
          model,
          group_type
        )
      `
      )
      .eq("customer_id", customerRecord.id)
      .order("created_at", { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      bookings = (data ?? []).map((row) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Tempahan Saya</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Semua tempahan anda dengan SabahCar
          </p>
        </div>
        {bookings.length > 0 && (
          <span className="bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl border border-teal-100">
            {bookings.length} Tempahan
          </span>
        )}
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
          Ralat: {fetchError}
        </div>
      )}

      {/* Empty — no customer record or no bookings */}
      {bookings.length === 0 && !fetchError && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <p className="text-gray-400 text-sm italic mb-2">
            Tiada tempahan lagi.
          </p>
          <p className="text-gray-400 text-xs">
            Minta sebut harga dari pasukan kami untuk memulakan.
          </p>
        </div>
      )}

      {/* Cards */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const badge =
              statusConfig[booking.status] ?? statusConfig.draft;
            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                {/* Car name + status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-base truncate">
                      {booking.vehicles?.name ?? "Kenderaan Tidak Diketahui"}
                    </p>
                    {booking.vehicles?.group_type && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {booking.vehicles.group_type}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Dates + locations */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tarikh Ambil</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(booking.pickup_datetime)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.pickup_location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      Tarikh Pulang
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(booking.drop_datetime)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.drop_location}
                    </p>
                  </div>
                </div>

                {/* Duration + total */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    {booking.days} hari sewaan
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {formatRM(booking.total_amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
