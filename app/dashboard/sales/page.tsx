import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function SalesDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData } = await serviceClient
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "sales") redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const stats = [
    { label: "Sebut Harga Hari Ini", value: "—", sub: "Dibuat hari ini", color: "text-blue-600" },
    { label: "Tempahan Bulan Ini", value: "—", sub: "Disahkan", color: "text-green-600" },
    { label: "Menunggu Respon", value: "—", sub: "Perlu follow up", color: "text-yellow-600" },
    { label: "Pelanggan Aktif", value: "—", sub: "Bulan ini", color: "text-indigo-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {userData?.full_name ?? "Sales"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Sales Dashboard — Urus Sebut Harga &amp; Tempahan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Sebut Harga Terbaru</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada sebut harga lagi. Quote system akan ditambah tidak lama lagi.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Tempahan Menunggu</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada tempahan menunggu. Senarai akan dikemas kini secara automatik.
          </p>
        </div>
      </div>
    </div>
  );
}
