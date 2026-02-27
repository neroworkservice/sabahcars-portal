import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { type BookingStatus } from "@/app/actions/bookings";
import PayOnlineButton from "./_components/PayOnlineButton";

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

  // Fetch ALL customer records linked to this auth email.
  // A customer can submit multiple inquiries, each creating a new customer row.
  // Using maybeSingle() would silently fail when multiple rows exist, so we
  // collect all matching IDs and query bookings with .in() instead.
  const { data: customerRecords } = await serviceClient
    .from("customers")
    .select("id")
    .eq("email", user.email!);

  const customerIds = (customerRecords ?? []).map((r) => r.id);

  let bookings: CustomerBooking[] = [];
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
      .in("customer_id", customerIds)
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

                {/* Payment section — confirmed */}
                {booking.status === "confirmed" && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">
                      Cara Pembayaran
                    </p>
                    <p className="text-xs text-yellow-700 mb-3">
                      Sila buat pembayaran dan hubungi kami via WhatsApp
                    </p>
                    <p className="text-sm font-bold text-gray-900 mb-3">
                      Jumlah: {formatRM(booking.total_amount)}
                    </p>

                    {/* Bank Transfer */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Pindahan Bank
                    </p>
                    <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-700 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bank</span>
                        <span className="font-medium">Maybank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nama</span>
                        <span className="font-medium">SabahCar Rental</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">No. Akaun</span>
                        <span className="font-medium">1234567890</span>
                      </div>
                    </div>

                    {/* TNG */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Touch &apos;n Go (TNG)
                    </p>
                    <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-700 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">No. TNG</span>
                        <span className="font-medium">013-2291201</span>
                      </div>
                    </div>

                    {/* Pay online button */}
                    <PayOnlineButton bookingId={booking.id} />

                    {/* Separator */}
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 border-t border-yellow-200" />
                      <span className="text-xs text-yellow-600 font-medium">— ATAU —</span>
                      <div className="flex-1 border-t border-yellow-200" />
                    </div>

                    {/* WhatsApp button */}
                    <a
                      href={`https://wa.me/60132291201?text=Saya%20mahu%20membuat%20pembayaran%20untuk%20tempahan%20${booking.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Hubungi via WhatsApp
                    </a>
                    <p className="mt-2 text-xs text-yellow-700 text-center">
                      Sertakan nombor tempahan dan resit pembayaran dalam WhatsApp anda
                    </p>
                  </div>
                )}

                {/* Payment section — ongoing */}
                {booking.status === "ongoing" && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-green-700">
                      Pembayaran Diterima ✓
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Tempahan anda sedang berjalan
                    </p>
                  </div>
                )}

                {/* Payment section — completed */}
                {booking.status === "completed" && (
                  <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-teal-700">
                      Tempahan Selesai ✓
                    </p>
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
