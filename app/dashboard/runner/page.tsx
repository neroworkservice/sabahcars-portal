import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function RunnerDashboardPage() {
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

  if (userData?.role !== "runner") redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const stats = [
    { label: "Tugasan Hari Ini", value: "—", sub: "Perlu dilaksanakan", color: "text-violet-600" },
    { label: "Selesai Minggu Ini", value: "—", sub: "Berjaya diselesaikan", color: "text-green-600" },
    { label: "Serah Terima Hari Ini", value: "—", sub: "Kereta untuk dihantar", color: "text-blue-600" },
    { label: "Tugasan Tertangguh", value: "—", sub: "Perlu perhatian", color: "text-red-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {userData?.full_name ?? "Runner"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Runner Dashboard — Tugasan &amp; Serah Terima</p>
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
          <h3 className="font-semibold text-gray-800 mb-4">Tugasan Hari Ini</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada tugasan lagi. Tugasan akan diberikan oleh admin.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Serah Terima Kereta</h3>
          <p className="text-sm text-gray-400 italic">
            Tiada serah terima dijadualkan. Data akan muncul selepas booking system siap.
          </p>
        </div>
      </div>
    </div>
  );
}
