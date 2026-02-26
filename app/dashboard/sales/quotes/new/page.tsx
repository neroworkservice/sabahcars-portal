import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getPricingData, getCustomers } from "@/app/actions/bookings";
import QuoteForm from "./_components/QuoteForm";

export default async function NewQuotePage() {
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

  if (!["admin", "sales", "agent"].includes(userData?.role ?? ""))
    redirect(`/dashboard/${userData?.role ?? "customer"}`);

  // Fetch pricing data and customers in parallel
  const [pricingResult, customersResult] = await Promise.all([
    getPricingData(),
    getCustomers(),
  ]);

  if ("error" in pricingResult) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
        Ralat memuatkan data: {pricingResult.error}
      </div>
    );
  }

  if ("error" in customersResult) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
        Ralat memuatkan pelanggan: {customersResult.error}
      </div>
    );
  }

  const { vehicles, priceRules, holidays, oneWayFees } = pricingResult.data;
  const { customers } = customersResult;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buat Sebut Harga Baru</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Isi maklumat di bawah untuk mengira harga dan membuat tempahan
        </p>
      </div>

      <QuoteForm
        vehicles={vehicles}
        customers={customers}
        priceRules={priceRules}
        holidays={holidays}
        oneWayFees={oneWayFees}
      />
    </div>
  );
}
