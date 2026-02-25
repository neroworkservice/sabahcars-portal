import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getLeads } from "@/app/actions/leads";
import LeadsTable from "./_components/LeadsTable";

export default async function SalesLeadsPage() {
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

  if (userData?.role !== "sales")
    redirect(`/dashboard/${userData?.role ?? "customer"}`);

  const result = await getLeads();
  const leadCount = "leads" in result ? result.leads.length : 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Saya</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Urus dan kemaskini status leads yang di-assign kepada anda
          </p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl border border-blue-100">
          {leadCount} Lead
        </span>
      </div>

      {"error" in result ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          Ralat: {result.error}
        </div>
      ) : (
        <LeadsTable leads={result.leads} />
      )}
    </div>
  );
}
