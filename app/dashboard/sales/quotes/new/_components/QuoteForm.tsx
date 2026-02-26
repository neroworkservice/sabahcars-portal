"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking, type Customer } from "@/app/actions/bookings";
import { calculatePrice } from "@/app/lib/pricing";
import type {
  Vehicle,
  PriceRule,
  Holiday,
  OneWayFee,
  PriceBreakdown,
} from "@/app/lib/pricing";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface QuoteFormProps {
  vehicles: Vehicle[];
  customers: Customer[];
  priceRules: PriceRule[];
  holidays: Holiday[];
  oneWayFees: OneWayFee[];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function rm(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

function BreakdownRow({
  label,
  value,
  sub,
  highlight,
  indent,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-2 py-1.5 ${
        highlight ? "border-t border-gray-200 pt-2.5 mt-1" : ""
      } ${indent ? "pl-3 border-l-2 border-gray-100" : ""}`}
    >
      <div className="min-w-0">
        <p
          className={`text-sm ${
            highlight ? "font-bold text-gray-900" : "text-gray-600"
          }`}
        >
          {label}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <p
        className={`text-sm shrink-0 ${
          highlight ? "font-bold text-gray-900 text-base" : "text-gray-800 font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function QuoteForm({
  vehicles,
  customers,
  priceRules,
  holidays,
  oneWayFees,
}: QuoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [pickupDatetime, setPickupDatetime] = useState("");
  const [dropDatetime, setDropDatetime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [notes, setNotes] = useState("");

  // Result state
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  const effectiveDropLocation = sameAsPickup ? pickupLocation : dropLocation;
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId) ?? null;

  // ─── Live price calculation (pure, client-side) ──────────────────────────
  useEffect(() => {
    setCalcError(null);

    if (
      !vehicleId ||
      !pickupDatetime ||
      !dropDatetime ||
      !pickupLocation ||
      !effectiveDropLocation
    ) {
      setBreakdown(null);
      return;
    }

    const pickupDate = new Date(pickupDatetime);
    const dropDate = new Date(dropDatetime);

    if (isNaN(pickupDate.getTime()) || isNaN(dropDate.getTime())) {
      setCalcError("Format tarikh tidak sah.");
      return;
    }

    if (dropDate <= pickupDate) {
      setCalcError("Tarikh pulang mesti selepas tarikh ambil.");
      setBreakdown(null);
      return;
    }

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      setCalcError("Kenderaan tidak dijumpai.");
      return;
    }

    const result = calculatePrice({
      vehicle,
      pickupDatetime: pickupDate,
      dropDatetime: dropDate,
      pickupLocation,
      dropLocation: effectiveDropLocation,
      priceRules,
      holidays,
      oneWayFees,
    });

    setBreakdown(result);
  }, [
    vehicleId,
    pickupDatetime,
    dropDatetime,
    pickupLocation,
    effectiveDropLocation,
    vehicles,
    priceRules,
    holidays,
    oneWayFees,
  ]);

  // ─── Submit ──────────────────────────────────────────────────────────────
  const canSubmit =
    !!customerId &&
    !!vehicleId &&
    !!pickupDatetime &&
    !!dropDatetime &&
    !!pickupLocation &&
    !!effectiveDropLocation &&
    !!breakdown &&
    !calcError;

  function handleSubmit() {
    if (!canSubmit || !breakdown) return;
    setSubmitError(null);

    startTransition(async () => {
      const result = await createBooking({
        customer_id: customerId,
        vehicle_id: vehicleId,
        pickup_datetime: new Date(pickupDatetime).toISOString(),
        drop_datetime: new Date(dropDatetime).toISOString(),
        pickup_location: pickupLocation,
        drop_location: effectiveDropLocation,
        notes: notes || undefined,
        priceBreakdown: breakdown,
      });

      if ("error" in result) {
        setSubmitError(result.error);
      } else {
        setSuccessBookingId(result.booking_id);
      }
    });
  }

  // ─── Success state ───────────────────────────────────────────────────────
  if (successBookingId) {
    return (
      <div className="bg-white rounded-xl border border-green-200 shadow-sm p-10 text-center max-w-md mx-auto mt-10">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tempahan Berjaya Dibuat!
        </h2>
        <p className="text-sm text-gray-500 mb-1">ID Tempahan:</p>
        <p className="font-mono text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mb-6 break-all">
          {successBookingId}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/sales/quotes")}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Lihat Senarai
          </button>
          <button
            onClick={() => {
              setSuccessBookingId(null);
              setCustomerId("");
              setVehicleId("");
              setPickupDatetime("");
              setDropDatetime("");
              setPickupLocation("");
              setDropLocation("");
              setSameAsPickup(false);
              setNotes("");
              setBreakdown(null);
            }}
            className="bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Quote Baru
          </button>
        </div>
      </div>
    );
  }

  // ─── Main form ───────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* ── Left: Form Fields ────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Maklumat Pelanggan
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Pilih Pelanggan <span className="text-red-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Pilih pelanggan —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.phone ? ` · ${c.phone}` : ""}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                Tiada pelanggan dalam sistem. Tambah pelanggan melalui Leads terlebih dahulu.
              </p>
            )}
          </div>
        </div>

        {/* Vehicle */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Pilih Kenderaan
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Kenderaan <span className="text-red-500">*</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Pilih kenderaan —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.group_type} · {v.seats} tempat duduk ·{" "}
                  {v.transmission === "auto" ? "Auto" : "Manual"} · RM{" "}
                  {v.base_rate.toFixed(2)}/hari
                </option>
              ))}
            </select>
          </div>

          {/* Selected vehicle detail card */}
          {selectedVehicle && (
            <div className="mt-3 bg-blue-50 rounded-lg px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div>
                <span className="text-gray-500">Kumpulan:</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedVehicle.group_type}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Tempat Duduk:</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedVehicle.seats}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Bagasi:</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedVehicle.luggage} unit
                </span>
              </div>
              <div>
                <span className="text-gray-500">Transmisi:</span>{" "}
                <span className="font-medium text-gray-800">
                  {selectedVehicle.transmission === "auto" ? "Automatik" : "Manual"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Kadar Harian:</span>{" "}
                <span className="font-semibold text-blue-700">
                  RM {selectedVehicle.base_rate.toFixed(2)}/hari
                </span>
              </div>
              {selectedVehicle.branch && (
                <div>
                  <span className="text-gray-500">Cawangan:</span>{" "}
                  <span className="font-medium text-gray-800">
                    {selectedVehicle.branch}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Tarikh & Masa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Tarikh & Masa Ambil <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={pickupDatetime}
                onChange={(e) => setPickupDatetime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Tarikh & Masa Pulang <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dropDatetime}
                onChange={(e) => setDropDatetime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Lokasi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Lokasi Ambil <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="cth. Kota Kinabalu Airport"
                value={pickupLocation}
                onChange={(e) => {
                  setPickupLocation(e.target.value);
                  if (sameAsPickup) setDropLocation(e.target.value);
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Lokasi Pulang <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sameAsPickup}
                    onChange={(e) => {
                      setSameAsPickup(e.target.checked);
                      if (e.target.checked) setDropLocation(pickupLocation);
                    }}
                    className="w-3.5 h-3.5 rounded accent-blue-600"
                  />
                  <span className="text-xs text-gray-500">Sama seperti lokasi ambil</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="cth. Sandakan City"
                value={effectiveDropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                disabled={sameAsPickup}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Nota (Pilihan)
          </h2>
          <textarea
            placeholder="Tambah nota atau arahan khas di sini..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            {submitError}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {isPending ? "Sedang memproses..." : "Buat Booking"}
        </button>
      </div>

      {/* ── Right: Price Breakdown Panel ─────────────────────────────────── */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Sebut Harga
          </h2>

          {/* Validation error */}
          {calcError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg p-3 mb-3">
              {calcError}
            </div>
          )}

          {/* Empty state */}
          {!breakdown && !calcError && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-xs leading-relaxed">
                Isi kenderaan, tarikh, dan lokasi untuk melihat anggaran harga secara langsung.
              </p>
            </div>
          )}

          {/* Breakdown */}
          {breakdown && (
            <div className="space-y-0.5">
              {/* Days */}
              <BreakdownRow
                label="Bilangan Hari"
                value={`${breakdown.days} hari`}
              />

              {/* Base */}
              <BreakdownRow
                label="Kadar Asas"
                value={rm(breakdown.baseTotal)}
                sub={`RM ${breakdown.baseRate.toFixed(2)} × ${breakdown.days} hari`}
                indent
              />

              {/* Discount */}
              {breakdown.discountPercent > 0 && (
                <BreakdownRow
                  label={`Diskaun ${breakdown.discountLabel}`}
                  value={`-${rm(breakdown.discountAmount)}`}
                  sub={`${breakdown.discountPercent}% diskaun`}
                  indent
                />
              )}

              {/* One-way fee */}
              {breakdown.isOneWay && breakdown.oneWayFee > 0 && (
                <BreakdownRow
                  label="Bayaran Sehala"
                  value={`+${rm(breakdown.oneWayFee)}`}
                  indent
                />
              )}
              {breakdown.isOneWay && breakdown.oneWayFee === 0 && (
                <BreakdownRow
                  label="Sehala (tiada bayaran)"
                  value="—"
                  indent
                />
              )}

              {/* Holiday uplift */}
              {breakdown.hasHoliday && (
                <BreakdownRow
                  label={`Caj Perayaan: ${breakdown.holidayName}`}
                  value={`+${rm(
                    breakdown.subtotal -
                      (breakdown.baseTotal -
                        breakdown.discountAmount +
                        breakdown.oneWayFee)
                  )}`}
                  sub={`+${breakdown.holidayUplift}% uplift`}
                  indent
                />
              )}

              {/* Subtotal */}
              <BreakdownRow
                label="Subtotal"
                value={rm(breakdown.subtotal)}
                highlight
              />

              {/* SST */}
              <BreakdownRow
                label={`SST ${breakdown.sstPercent}%`}
                value={`+${rm(breakdown.sstAmount)}`}
                indent
              />

              {/* Total */}
              <div className="mt-3 pt-3 border-t-2 border-gray-900">
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-gray-900">JUMLAH</p>
                  <p className="text-xl font-bold text-blue-600">
                    {rm(breakdown.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                {breakdown.isOneWay && (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                    Sehala
                  </span>
                )}
                {breakdown.hasHoliday && (
                  <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                    Perayaan: {breakdown.holidayName}
                  </span>
                )}
                {breakdown.discountPercent > 0 && (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                    Diskaun {breakdown.discountPercent}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
