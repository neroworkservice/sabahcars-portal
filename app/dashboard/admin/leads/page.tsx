import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getLeads } from "@/app/actions/leads";
import AdminLeadsView from "./_components/AdminLeadsView";

export default async function AdminLeadsPage() {
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
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin")
    redirect(`/dashboard/${userData?.role ?? "customer"}`);

  // Fetch leads dan sales users secara parallel
  const [leadsResult, { data: salesUsers }] = await Promise.all([
    getLeads(),
    serviceClient
      .from("users")
      .select("id, full_name")
      .eq("role", "sales")
      .order("full_name"),
  ]);

  const leadCount = "leads" in leadsResult ? leadsResult.leads.length : 0;
  const unassignedCount =
    "leads" in leadsResult
      ? leadsResult.leads.filter((l) => !l.assigned_to).length
      : 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Leads</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Urus dan assign leads kepada pasukan sales
          </p>
        </div>
        <div className="flex gap-2">
          {unassignedCount > 0 && (
            <span className="bg-yellow-50 text-yellow-700 text-sm font-semibold px-4 py-2 rounded-xl border border-yellow-100">
              {unassignedCount} Belum Assign
            </span>
          )}
          <span className="bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl border border-indigo-100">
            {leadCount} Lead
          </span>
        </div>
      </div>

      {"error" in leadsResult ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          Ralat: {leadsResult.error}
        </div>
      ) : (
        <AdminLeadsView
          leads={leadsResult.leads}
          salesUsers={salesUsers ?? []}
        />
      )}
    </div>
  );
}
