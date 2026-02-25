"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

type LeadStatus = "new" | "contacted" | "quoted" | "converted" | "lost";
type LeadSource = "walk_in" | "whatsapp" | "phone" | "website" | "agent";

const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set("connection", "close");
  return fetch(url, {
    ...init,
    headers,
  });
};

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: customFetch } }
  );
}

// ─── 1. CREATE LEAD ──────────────────────────────────────────────────────────
// Insert customer dulu, lepas tu insert lead dengan customer_id
export async function createLead(
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const pickup_date = formData.get("pickup_date") as string;
  const drop_date = formData.get("drop_date") as string;
  const source = (formData.get("source") as LeadSource) || "whatsapp";
  const notes = formData.get("notes") as string;

  if (!name) return { error: "Nama pelanggan diperlukan." };

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan. Sila log masuk semula." };

  const serviceClient = getServiceClient();

  // Semak role — sales/agent auto-assign kepada diri sendiri, customer biar null
  const { data: creatorData } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const assignedTo = ["sales", "agent"].includes(creatorData?.role ?? "")
    ? user.id
    : null;

  // Step 1: Insert customer
  const { data: customer, error: customerError } = await serviceClient
    .from("customers")
    .insert({
      name,
      phone: phone || null,
      email: email || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (customerError || !customer) {
    return { error: customerError?.message || "Gagal cipta pelanggan." };
  }

  // Step 2: Insert lead dengan customer_id
  const { error: leadError } = await serviceClient.from("leads").insert({
    customer_id: customer.id,
    source,
    status: "new",
    assigned_to: assignedTo,
    notes: notes || null,
    pickup_date: pickup_date || null,
    drop_date: drop_date || null,
  });

  if (leadError) return { error: leadError.message };

  return { success: true };
}

// ─── 2. GET LEADS ─────────────────────────────────────────────────────────────
// Admin: semua leads | Sales: leads assigned to current user sahaja
export async function getLeads(): Promise<
  | { leads: Lead[] }
  | { error: string }
> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  // Verify role
  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };

  let query = serviceClient
    .from("leads")
    .select(
      `
      id,
      status,
      source,
      notes,
      pickup_date,
      drop_date,
      assigned_to,
      created_at,
      updated_at,
      customers (
        id,
        name,
        phone,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  // Sales hanya nampak leads yang di-assign kepada dia
  if (userData.role === "sales") {
    query = query.eq("assigned_to", user.id);
  }

  const { data: leads, error: leadsError } = await query;

  if (leadsError) return { error: leadsError.message };

  return { leads: (leads ?? []) as Lead[] };
}

// ─── 3. UPDATE LEAD STATUS ────────────────────────────────────────────────────
export async function updateLeadStatus(
  lead_id: string,
  status: LeadStatus
): Promise<{ success: true } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  const { error } = await serviceClient
    .from("leads")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead_id);

  if (error) return { error: error.message };

  return { success: true };
}

// ─── 4. ASSIGN LEAD ───────────────────────────────────────────────────────────
// Admin only - assign lead kepada sales staff
export async function assignLead(
  lead_id: string,
  user_id: string
): Promise<{ success: true } | { error: string }> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "Tidak dibenarkan." };

  const serviceClient = getServiceClient();

  // Check admin role
  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return { error: "Gagal verify role." };

  if (userData.role !== "admin") {
    return { error: "Hanya admin boleh assign lead." };
  }

  const { error } = await serviceClient
    .from("leads")
    .update({
      assigned_to: user_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead_id);

  if (error) return { error: error.message };

  return { success: true };
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type Lead = {
  id: string;
  status: LeadStatus;
  source: LeadSource;
  notes: string | null;
  pickup_date: string | null;
  drop_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  customers: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
};
