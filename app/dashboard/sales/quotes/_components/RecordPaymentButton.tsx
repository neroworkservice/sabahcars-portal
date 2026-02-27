"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPayment, type PaymentMethod } from "@/app/actions/payments";

export default function RecordPaymentButton({
  bookingId,
  totalAmount,
}: {
  bookingId: string;
  totalAmount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(totalAmount.toFixed(2));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function openModal() {
    setAmount(totalAmount.toFixed(2));
    setMethod("cash");
    setReferenceNo("");
    setNotes("");
    setError("");
    setSuccess(false);
    setOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Jumlah bayaran tidak sah.");
      return;
    }

    startTransition(async () => {
      const result = await createPayment({
        booking_id: bookingId,
        amount: parsedAmount,
        method,
        reference_no: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1500);
      }
    });
  }

  return (
    <>
      <button
        onClick={openModal}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
      >
        Rekod Bayaran
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Rekod Bayaran</h2>
              <button
                onClick={closeModal}
                disabled={isPending}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-semibold">Bayaran berjaya direkodkan!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah (RM) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kaedah <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="cash">Tunai</option>
                    <option value="bank_transfer">Pindahan Bank</option>
                    <option value="tng">Touch n Go</option>
                  </select>
                </div>

                {/* Reference No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Rujukan
                    <span className="text-gray-400 font-normal ml-1">(pilihan)</span>
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="cth. TXN123456"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nota
                    <span className="text-gray-400 font-normal ml-1">(pilihan)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Tambah nota jika perlu..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="text-sm font-semibold px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Bayaran"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
