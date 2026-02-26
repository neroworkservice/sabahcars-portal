// ─── TYPES ────────────────────────────────────────────────────────────────────

export type VehicleStatus = "available" | "rented" | "maintenance";
export type OwnerType = "company" | "supplier";
export type Transmission = "auto" | "manual";

export type Vehicle = {
  id: string;
  name: string;
  model: string;
  group_type: string;
  seats: number;
  luggage: number;
  transmission: Transmission;
  base_rate: number;
  status: VehicleStatus;
  owner_type: OwnerType;
  branch: string | null;
};

export type PriceRule = {
  id: string;
  min_days: number;
  max_days: number | null; // null = no upper limit
  discount_percent: number;
  label: string;
};

export type Holiday = {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  uplift_percent: number;
};

export type OneWayFee = {
  id: string;
  from_location: string;
  to_location: string;
  fee: number;
};

export type PriceBreakdown = {
  days: number;
  baseRate: number;
  baseTotal: number;
  discountPercent: number;
  discountLabel: string;
  discountAmount: number;
  isOneWay: boolean;
  oneWayFee: number;
  hasHoliday: boolean;
  holidayName: string;
  holidayUplift: number; // percent, e.g. 25
  subtotal: number;
  sstPercent: number;
  sstAmount: number;
  totalAmount: number;
};

export type CalculatePriceParams = {
  vehicle: Vehicle;
  pickupDatetime: Date;
  dropDatetime: Date;
  pickupLocation: string;
  dropLocation: string;
  priceRules: PriceRule[];
  holidays: Holiday[];
  oneWayFees: OneWayFee[];
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── 1. CALCULATE DAYS ────────────────────────────────────────────────────────
// Minimum 1 day.
// Fractional day rule (applied to the leftover hours after full days):
//   < 4 hours remainder  → +0.5 day
//   ≥ 4 hours remainder  → +1 full day

export function calculateDays(pickup: Date, drop: Date): number {
  const totalHours = (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60);

  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  let days: number;

  if (remainingHours === 0) {
    days = fullDays;
  } else if (remainingHours < 4) {
    days = fullDays + 0.5;
  } else {
    days = fullDays + 1;
  }

  return Math.max(1, days);
}

// ─── 2. GET DISCOUNT ──────────────────────────────────────────────────────────
// Match days against price_rules (min_days ≤ days ≤ max_days).
// max_days null means no upper bound.

export function getDiscount(
  days: number,
  priceRules: PriceRule[]
): { percent: number; label: string } {
  const match = priceRules.find(
    (rule) =>
      days >= rule.min_days &&
      (rule.max_days === null || days <= rule.max_days)
  );

  if (!match) return { percent: 0, label: "" };

  return { percent: match.discount_percent, label: match.label };
}

// ─── 3. GET HOLIDAY UPLIFT ────────────────────────────────────────────────────
// Enumerate every calendar day in [pickupDate, dropDate].
// Return the HIGHEST uplift_percent among all matching holidays.

export function getHolidayUplift(
  pickupDate: Date,
  dropDate: Date,
  holidays: Holiday[]
): { uplift: number; name: string; hasHoliday: boolean } {
  const bookingDates: string[] = [];

  const cursor = new Date(pickupDate);
  cursor.setHours(0, 0, 0, 0);

  const lastDay = new Date(dropDate);
  lastDay.setHours(0, 0, 0, 0);

  while (cursor <= lastDay) {
    bookingDates.push(cursor.toISOString().split("T")[0]); // "YYYY-MM-DD"
    cursor.setDate(cursor.getDate() + 1);
  }

  const matched = holidays.filter((h) => bookingDates.includes(h.date));

  if (matched.length === 0) {
    return { uplift: 0, name: "", hasHoliday: false };
  }

  // Return the holiday with the highest uplift
  const highest = matched.reduce((prev, curr) =>
    curr.uplift_percent > prev.uplift_percent ? curr : prev
  );

  return {
    uplift: highest.uplift_percent,
    name: highest.name,
    hasHoliday: true,
  };
}

// ─── 4. CALCULATE PRICE ───────────────────────────────────────────────────────
// Formula:
//   baseTotal        = base_rate × days
//   discountAmount   = baseTotal × discountPercent / 100
//   afterDiscount    = baseTotal − discountAmount
//   holidayUplift    = afterDiscount × upliftPercent / 100  (applied post-discount)
//   subtotal         = afterDiscount + oneWayFee + holidayUpliftAmount
//   sstAmount        = subtotal × SST_PERCENT / 100
//   totalAmount      = subtotal + sstAmount

const SST_PERCENT = 8; // Malaysia SST for services

export function calculatePrice(params: CalculatePriceParams): PriceBreakdown {
  const {
    vehicle,
    pickupDatetime,
    dropDatetime,
    pickupLocation,
    dropLocation,
    priceRules,
    holidays,
    oneWayFees,
  } = params;

  // Step 1 — Days
  const days = calculateDays(pickupDatetime, dropDatetime);

  // Step 2 — Base
  const baseRate = vehicle.base_rate;
  const baseTotal = round2(baseRate * days);

  // Step 3 — Discount
  const discount = getDiscount(days, priceRules);
  const discountAmount = round2((baseTotal * discount.percent) / 100);
  const afterDiscount = round2(baseTotal - discountAmount);

  // Step 4 — One-way fee
  const isOneWay =
    pickupLocation.trim().toLowerCase() !== dropLocation.trim().toLowerCase();

  let oneWayFee = 0;
  if (isOneWay) {
    const feeRecord = oneWayFees.find(
      (f) =>
        f.from_location.trim().toLowerCase() ===
          pickupLocation.trim().toLowerCase() &&
        f.to_location.trim().toLowerCase() === dropLocation.trim().toLowerCase()
    );
    oneWayFee = feeRecord?.fee ?? 0;
  }

  // Step 5 — Holiday uplift (applied on after-discount amount)
  const holidayInfo = getHolidayUplift(pickupDatetime, dropDatetime, holidays);
  const holidayUpliftAmount = round2(
    (afterDiscount * holidayInfo.uplift) / 100
  );

  // Step 6 — Subtotal & SST
  const subtotal = round2(afterDiscount + oneWayFee + holidayUpliftAmount);
  const sstAmount = round2((subtotal * SST_PERCENT) / 100);
  const totalAmount = round2(subtotal + sstAmount);

  return {
    days,
    baseRate,
    baseTotal,
    discountPercent: discount.percent,
    discountLabel: discount.label,
    discountAmount,
    isOneWay,
    oneWayFee,
    hasHoliday: holidayInfo.hasHoliday,
    holidayName: holidayInfo.name,
    holidayUplift: holidayInfo.uplift,
    subtotal,
    sstPercent: SST_PERCENT,
    sstAmount,
    totalAmount,
  };
}
