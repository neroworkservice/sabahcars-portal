import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function AgentDashboardPage() {
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

  if (userData?.role !== "agent") redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const stats = [
    { label: "Tempahan Saya", value: "—", sub: "Keseluruhan", color: "text-green-600" },
    { label: "Komisen Bulan Ini", value: "—", sub: "Terkumpul", color: "text-blue-600" },
    { label: "Pelanggan Aktif", value: "—", sub: "Dalam pengurusan", color: "text-teal-600" },
    { label: "Tempahan Menunggu", value: "—", sub: "Perlu tindakan", color: "text-yellow-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {userData?.full_name ?? "Agent"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Agent Dashboard — Urus Pelanggan &amp; Komisen</p>
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
          <h3 className="font-semibold text-gray-800 mb-4">Tempahan Terkini</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada tempahan lagi. Data akan muncul selepas booking system siap.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Komisen Terkumpul</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada rekod komisen lagi. Sistem komisen akan ditambah tidak lama lagi.
          </p>
        </div>
      </div>
    </div>
  );
}
