"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  updateBookingStatus,
  type BookingStatus,
} from "@/app/actions/bookings";

const ALL_STATUSES: BookingStatus[] = [
  "draft",
  "quoted",
  "confirmed",
  "ongoing",
  "completed",
  "cancelled",
];

const statusLabels: Record<BookingStatus, string> = {
  draft: "Draf",
  quoted: "Sebut Harga",
  confirmed: "Disahkan",
  ongoing: "Sedang Berjalan",
  completed: "Selesai",
  cancelled: "Dibatal",
};

export default function StatusSelect({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as BookingStatus;
    startTransition(async () => {
      await updateBookingStatus(bookingId, newStatus);
      router.refresh();
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 cursor-pointer"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  );
}
