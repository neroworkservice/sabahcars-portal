import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function SupplierDashboardPage() {
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

  if (userData?.role !== "supplier") redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const stats = [
    { label: "Jumlah Kenderaan", value: "—", sub: "Dalam fleet", color: "text-orange-600" },
    { label: "Kenderaan Tersedia", value: "—", sub: "Boleh ditempah", color: "text-green-600" },
    { label: "Sedang Digunakan", value: "—", sub: "Hari ini", color: "text-blue-600" },
    { label: "Tempahan Masuk", value: "—", sub: "Menunggu pengesahan", color: "text-yellow-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {userData?.full_name ?? "Supplier"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Supplier Dashboard — Urus Fleet &amp; Ketersediaan</p>
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
          <h3 className="font-semibold text-gray-800 mb-4">Kenderaan Dalam Fleet</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada kenderaan lagi. Fleet management akan ditambah tidak lama lagi.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Tempahan Masuk</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada tempahan lagi. Data akan muncul selepas booking system siap.
          </p>
        </div>
      </div>
    </div>
  );
}
