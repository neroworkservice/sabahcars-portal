"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/actions/leads";

export default function DeleteButton({
  leadId,
  status,
}: {
  leadId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status !== "new") return null;

  const handleDelete = () => {
    if (!window.confirm("Padam lead ini? Tindakan ini tidak boleh dibatalkan."))
      return;

    startTransition(async () => {
      const result = await deleteLead(leadId);
      if ("error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs bg-red-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {isPending ? "..." : "Padam"}
    </button>
  );
}
