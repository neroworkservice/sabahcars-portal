"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmQuote } from "@/app/actions/bookings";

interface ConfirmButtonProps {
  bookingId: string;
}

export default function ConfirmButton({ bookingId }: ConfirmButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await confirmQuote(bookingId);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      // Refresh the page to reflect the updated status
      router.refresh();
    }
  }

  return (
    <div>
      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-teal-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Mengesahkan..." : "Terima Quote"}
      </button>
    </div>
  );
}
