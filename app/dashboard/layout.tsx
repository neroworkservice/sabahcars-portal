import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import Sidebar from "./_components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData, error } = await serviceClient
    .from("users")
    .select("full_name, role, email")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        role={userData.role}
        fullName={userData.full_name}
        email={userData.email}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              SabahCar Portal
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Log Keluar
            </button>
          </form>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
