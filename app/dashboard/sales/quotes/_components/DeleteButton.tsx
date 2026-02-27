"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteBooking, type BookingStatus } from "@/app/actions/bookings";

export default function DeleteButton({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status !== "draft") return null;

  function handleClick() {
    if (
      !window.confirm(
        "Padam tempahan ini? Tindakan ini tidak boleh dibatalkan."
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteBooking(bookingId);
      if ("error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Memadamkan..." : "Padam"}
    </button>
  );
}
