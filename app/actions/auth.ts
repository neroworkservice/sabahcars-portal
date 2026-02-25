"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | never> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (userError || !userData) {
    await supabase.auth.signOut();
    return { error: "Could not verify user role." };
  }

  if (userData.role !== role) {
    await supabase.auth.signOut();
    return { error: "Invalid role selected" };
  }

  redirect(`/dashboard/${role}`);
}

export async function registerAction(
  formData: FormData
): Promise<{ error: string } | never> {
  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?registered=true");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
