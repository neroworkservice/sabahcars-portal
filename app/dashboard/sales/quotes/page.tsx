import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getBookings, type Booking, type BookingStatus } from "@/app/actions/bookings";

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  pending: {
    label: "Menunggu",
    color: "bg-gray-100 text-gray-600",
  },
  confirmed: {
    label: "Disahkan",
    color: "bg-green-100 text-green-700",
  },
  active: {
    label: "Aktif",
    color: "bg-orange-100 text-orange-700",
  },
  completed: {
    label: "Selesai",
    color: "bg-teal-100 text-teal-700",
  },
  cancelled: {
    label: "Dibatal",
    color: "bg-red-100 text-red-700",
  },
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

export default async function SalesQuotesPage() {
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

  if (userData?.role !== "sales")
    redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const result = await getBookings();
  const bookings: Booking[] = "bookings" in result ? result.bookings : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sebut Harga & Tempahan</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Senarai semua sebut harga dan tempahan yang anda buat
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl border border-blue-100">
            {bookings.length} Rekod
          </span>
          <Link
            href="/dashboard/sales/quotes/new"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Buat Quote Baru
          </Link>
        </div>
      </div>

      {/* Error state */}
      {"error" in result && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
          Ralat: {result.error}
        </div>
      )}

      {/* Empty state */}
      {bookings.length === 0 && !("error" in result) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <p className="text-gray-400 text-sm italic mb-4">
            Tiada tempahan lagi. Buat quote baru untuk pelanggan anda.
          </p>
          <Link
            href="/dashboard/sales/quotes/new"
            className="inline-block bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Buat Quote Baru
          </Link>
        </div>
      )}

      {/* Table */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Pelanggan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Kenderaan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tarikh Ambil
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tarikh Pulang
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Hari
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Jumlah
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => {
                  const badge =
                    statusConfig[booking.status] ?? statusConfig.pending;
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {booking.customers?.name ?? "—"}
                        </p>
                        {booking.customers?.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {booking.customers.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {booking.vehicles?.name ?? "—"}
                        </p>
                        {booking.vehicles?.group_type && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {booking.vehicles.group_type}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDatetime(booking.pickup_datetime)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDatetime(booking.drop_datetime)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">
                        {booking.days} hari
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatRM(booking.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
