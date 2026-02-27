"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus, assignLead, type Lead } from "@/app/actions/leads";
import DeleteButton from "./DeleteButton";

type LeadStatus = "new" | "contacted" | "quoted" | "converted" | "lost";

type SalesUser = {
  id: string;
  full_name: string;
};

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "Baru", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Dihubungi", color: "bg-yellow-100 text-yellow-700" },
  quoted: { label: "Sebut Harga", color: "bg-purple-100 text-purple-700" },
  converted: { label: "Ditukar", color: "bg-green-100 text-green-700" },
  lost: { label: "Hilang", color: "bg-red-100 text-red-700" },
};

const sourceLabel: Record<string, string> = {
  walk_in: "Walk In",
  whatsapp: "WhatsApp",
  phone: "Telefon",
  website: "Website",
  agent: "Ejen",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusCell({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<LeadStatus>(lead.status);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    if (selected === lead.status) return;
    setError(null);
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, selected);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as LeadStatus)}
          disabled={isPending}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {(
            Object.entries(statusConfig) as [
              LeadStatus,
              { label: string; color: string }
            ][]
          ).map(([val, cfg]) => (
            <option key={val} value={val}>
              {cfg.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={isPending || selected === lead.status}
          className="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isPending ? "..." : "Update"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function AssignCell({
  lead,
  salesUsers,
}: {
  lead: Lead;
  salesUsers: SalesUser[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(lead.assigned_to ?? "");
  const [error, setError] = useState<string | null>(null);

  const assignedName = salesUsers.find(
    (u) => u.id === lead.assigned_to
  )?.full_name;

  const handleAssign = () => {
    if (!selected || selected === lead.assigned_to) return;
    setError(null);
    startTransition(async () => {
      const result = await assignLead(lead.id, selected);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-1">
      {assignedName ? (
        <p className="text-xs font-medium text-gray-700">{assignedName}</p>
      ) : (
        <p className="text-xs text-gray-400 italic">Belum assign</p>
      )}
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={isPending || salesUsers.length === 0}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          <option value="">Pilih sales...</option>
          {salesUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={isPending || !selected || selected === lead.assigned_to}
          className="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isPending ? "..." : "Assign"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface AdminLeadsViewProps {
  leads: Lead[];
  salesUsers: SalesUser[];
}

export default function AdminLeadsView({
  leads,
  salesUsers,
}: AdminLeadsViewProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
        <p className="text-gray-400 text-sm italic">
          Tiada leads dalam sistem lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pelanggan
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Telefon
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sumber
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tarikh Pickup
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Assign Kepada
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => {
              const badge = statusConfig[lead.status] ?? statusConfig.new;
              return (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {lead.customers?.name ?? "—"}
                    </p>
                    {lead.customers?.email && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lead.customers.email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {lead.customers?.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {sourceLabel[lead.source] ?? lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(lead.pickup_date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <StatusCell lead={lead} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AssignCell lead={lead} salesUsers={salesUsers} />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton leadId={lead.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
