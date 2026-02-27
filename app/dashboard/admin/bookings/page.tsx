import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getBookings, type Booking, type BookingStatus } from "@/app/actions/bookings";
import StatusSelect from "./_components/StatusSelect";
import DeleteButton from "./_components/DeleteButton";
import RecordPaymentButton from "./_components/RecordPaymentButton";

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  draft: { label: "Draf", color: "bg-gray-100 text-gray-600" },
  quoted: { label: "Sebut Harga", color: "bg-blue-100 text-blue-600" },
  confirmed: { label: "Disahkan", color: "bg-green-100 text-green-600" },
  ongoing: { label: "Sedang Berjalan", color: "bg-orange-100 text-orange-600" },
  completed: { label: "Selesai", color: "bg-teal-100 text-teal-600" },
  cancelled: { label: "Dibatal", color: "bg-red-100 text-red-600" },
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

export default async function AdminBookingsPage() {
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

  if (userData?.role !== "admin")
    redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const [bookingsResult, { data: salesUsers }] = await Promise.all([
    getBookings(),
    serviceClient
      .from("users")
      .select("id, full_name")
      .in("role", ["sales", "agent"])
      .order("full_name"),
  ]);

  const bookings: Booking[] =
    "bookings" in bookingsResult ? bookingsResult.bookings : [];

  const salesMap = new Map<string, string>(
    (salesUsers ?? []).map((u) => [u.id, u.full_name])
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Tempahan</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Urus dan kemaskini status semua tempahan dalam sistem
          </p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl border border-indigo-100">
          {bookings.length} Tempahan
        </span>
      </div>

      {/* Error */}
      {"error" in bookingsResult && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
          Ralat: {bookingsResult.error}
        </div>
      )}

      {/* Empty */}
      {bookings.length === 0 && !("error" in bookingsResult) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <p className="text-gray-400 text-sm italic">
            Tiada tempahan lagi dalam sistem.
          </p>
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
                    Jumlah
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sales
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => {
                  const badge =
                    statusConfig[booking.status] ?? statusConfig.draft;
                  const salesName =
                    salesMap.get(booking.sales_id) ?? "—";
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
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatRM(booking.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {salesName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <StatusSelect
                            bookingId={booking.id}
                            currentStatus={booking.status}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!["ongoing", "completed", "cancelled"].includes(booking.status) && (
                            <RecordPaymentButton
                              bookingId={booking.id}
                              totalAmount={booking.total_amount}
                            />
                          )}
                          <DeleteButton bookingId={booking.id} />
                        </div>
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
