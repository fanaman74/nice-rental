"use client";

import { useState } from "react";
import { Trash2, BedDouble, User, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteBooking, markDepositPaid, markDepositReturned } from "@/lib/actions";

type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  phone: string | null;
  startMonth: string | Date;
  durationMonths: number;
  depositAmount: number;
  depositPaid: boolean;
  depositReturned: boolean;
  notes: string | null;
  room: { name: string };
};

function formatMonth(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function endMonth(start: string | Date, duration: number) {
  const d = new Date(start);
  d.setMonth(d.getMonth() + duration - 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function isCurrentlyActive(start: string | Date, duration: number): boolean {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const s = new Date(start);
  const end = new Date(s);
  end.setMonth(end.getMonth() + duration);
  return s <= thisMonth && thisMonth < end;
}

function isPast(start: string | Date, duration: number): boolean {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const s = new Date(start);
  const end = new Date(s);
  end.setMonth(end.getMonth() + duration);
  return end <= thisMonth;
}

export function BookingList({ bookings }: { bookings: Booking[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleCancel(id: string, name: string) {
    if (!confirm(`Cancel booking for ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    await deleteBooking(id);
    setDeleting(null);
  }

  async function handleMarkDepositPaid(id: string) {
    setActioning(id + "-paid");
    await markDepositPaid(id);
    setActioning(null);
  }

  async function handleMarkDepositReturned(id: string) {
    setActioning(id + "-returned");
    await markDepositReturned(id);
    setActioning(null);
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <BedDouble className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No bookings yet</p>
        <p className="text-sm mt-1">Click &ldquo;New booking&rdquo; to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const active = isCurrentlyActive(b.startMonth, b.durationMonths);
        const past = isPast(b.startMonth, b.durationMonths);
        const hasDeposit = b.depositAmount > 0;

        return (
          <div
            key={b.id}
            className={`bg-white rounded-2xl border p-5 transition-shadow ${
              active ? "border-primary/30 bg-primary/5 hover:shadow-sm" : "border-zinc-200 hover:shadow-sm"
            }`}
          >
            {/* Top row */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-5 w-5 text-zinc-400" />
              </div>

              {/* Guest info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-900 text-sm">{b.guestName}</span>
                  {active && (
                    <Badge className="bg-primary/15 text-primary border-0 text-xs">Active now</Badge>
                  )}
                  {past && (
                    <Badge variant="secondary" className="text-xs">Past</Badge>
                  )}
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">{b.guestEmail}</p>
                {b.phone && (
                  <p className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
                    <Phone className="h-3 w-3" />{b.phone}
                  </p>
                )}
              </div>

              {/* Room */}
              <div className="hidden sm:block text-center shrink-0">
                <p className="text-xs text-zinc-400">Room</p>
                <p className="text-sm font-medium text-zinc-700 max-w-[120px] truncate">{b.room.name}</p>
              </div>

              {/* Dates */}
              <div className="text-center shrink-0">
                <p className="text-xs text-zinc-400">Period</p>
                <p className="text-sm font-medium text-zinc-700">
                  {formatMonth(b.startMonth)} → {endMonth(b.startMonth, b.durationMonths)}
                </p>
                <p className="text-xs text-zinc-400">{b.durationMonths}mo</p>
              </div>

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                disabled={deleting === b.id}
                onClick={() => handleCancel(b.id, b.guestName)}
                className="rounded-full h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Bottom row: deposit + notes */}
            {(hasDeposit || b.notes) && (
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-4 flex-wrap">
                {/* Deposit status */}
                {hasDeposit && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 font-medium">
                      Deposit €{b.depositAmount}:
                    </span>
                    {!b.depositPaid ? (
                      <button
                        onClick={() => handleMarkDepositPaid(b.id)}
                        disabled={actioning === b.id + "-paid"}
                        className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                      >
                        {actioning === b.id + "-paid" ? "…" : "Not collected — mark paid"}
                      </button>
                    ) : !b.depositReturned ? (
                      <>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Collected
                        </span>
                        {past && (
                          <button
                            onClick={() => handleMarkDepositReturned(b.id)}
                            disabled={actioning === b.id + "-returned"}
                            className="text-xs px-2.5 py-1 rounded-full bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                          >
                            {actioning === b.id + "-returned" ? "…" : "Mark returned"}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                        Returned
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {b.notes && (
                  <p className="text-xs text-zinc-500 flex items-start gap-1 flex-1">
                    <FileText className="h-3 w-3 mt-0.5 shrink-0 text-zinc-400" />
                    {b.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
