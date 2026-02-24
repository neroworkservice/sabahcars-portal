"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
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
