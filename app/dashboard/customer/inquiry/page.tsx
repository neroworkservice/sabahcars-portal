"use client";

import { useState, useTransition } from "react";
import { createLead } from "@/app/actions/leads";

export default function CustomerInquiryPage() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createLead(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hantar Inquiry</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Minta sebut harga kereta sewa dari pasukan kami
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center max-w-lg">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Inquiry Berjaya Dihantar!
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Terima kasih! Pasukan sales kami akan menghubungi anda dalam masa{" "}
            <span className="font-semibold text-gray-700">24 jam</span>.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Hantar Inquiry Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hantar Inquiry</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Isi borang di bawah untuk minta sebut harga kereta sewa
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-2xl">
        <form action={handleSubmit} className="space-y-5">
          {/* Nama + Telefon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Penuh <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Contoh: Ahmad bin Ali"
                disabled={isPending}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                No. Telefon
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="Contoh: 0123456789"
                disabled={isPending}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Emel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alamat Emel
            </label>
            <input
              name="email"
              type="email"
              placeholder="contoh@email.com"
              disabled={isPending}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 placeholder:text-gray-300"
            />
          </div>

          {/* Tarikh Ambil + Pulang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tarikh &amp; Masa Ambil
              </label>
              <input
                name="pickup_date"
                type="datetime-local"
                disabled={isPending}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tarikh &amp; Masa Pulang
              </label>
              <input
                name="drop_date"
                type="datetime-local"
                disabled={isPending}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          {/* Sumber */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dari Mana Anda Tahu Tentang Kami?
            </label>
            <select
              name="source"
              defaultValue="website"
              disabled={isPending}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 bg-white"
            >
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Telefon</option>
            </select>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Catatan Tambahan
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Contoh: Perlu kereta 7 tempat duduk untuk trip ke Kundasang, 5 orang dewasa..."
              disabled={isPending}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Menghantar..." : "Hantar Inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
