"use client";

import { useState } from "react";
import { createHitPayPayment } from "@/app/actions/payments";

type Props = {
  bookingId: string;
};

export default function PayOnlineButton({ bookingId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const result = await createHitPayPayment(bookingId);
    if ("error" in result) {
      alert(result.error);
      setLoading(false);
      return;
    }
    window.location.href = result.payment_url;
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
    >
      {loading ? "Memproses..." : "Bayar Sekarang"}
    </button>
  );
}
