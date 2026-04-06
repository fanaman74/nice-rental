"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ROOM_COLORS = [
  { bg: "bg-blue-500",    light: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-300"   },
  { bg: "bg-emerald-500", light: "bg-emerald-100",  text: "text-emerald-700", border: "border-emerald-300" },
  { bg: "bg-violet-500",  light: "bg-violet-100",   text: "text-violet-700",  border: "border-violet-300"  },
  { bg: "bg-amber-500",   light: "bg-amber-100",    text: "text-amber-700",   border: "border-amber-300"   },
  { bg: "bg-rose-500",    light: "bg-rose-100",     text: "text-rose-700",    border: "border-rose-300"    },
  { bg: "bg-cyan-500",    light: "bg-cyan-100",     text: "text-cyan-700",    border: "border-cyan-300"    },
];

type Booking = {
  id: string;
  guestName: string;
  startMonth: string | Date;
  durationMonths: number;
  roomId: string;
};

type Room = {
  id: string;
  name: string;
};

interface BookingCalendarProps {
  rooms: Room[];
  bookings: Booking[];
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function BookingCalendar({ rooms, bookings }: BookingCalendarProps) {
  const now = new Date();
  const [viewStart, setViewStart] = useState(
    new Date(now.getFullYear(), now.getMonth() - 1, 1)
  );

  // Show 6 months at a time
  const MONTHS_SHOWN = 6;
  const months: Date[] = Array.from({ length: MONTHS_SHOWN }, (_, i) =>
    addMonths(viewStart, i)
  );

  const roomColorMap = Object.fromEntries(
    rooms.map((r, i) => [r.id, ROOM_COLORS[i % ROOM_COLORS.length]])
  );

  function prev() { setViewStart((d) => addMonths(d, -3)); }
  function next() { setViewStart((d) => addMonths(d, 3)); }
  function goToday() { setViewStart(new Date(now.getFullYear(), now.getMonth() - 1, 1)); }

  // For each room + month, find if there's a booking
  function getBooking(roomId: string, month: Date): Booking | undefined {
    return bookings.find((b) => {
      const start = new Date(b.startMonth);
      const end = addMonths(start, b.durationMonths);
      return b.roomId === roomId && start <= month && month < end;
    });
  }

  function isBookingStart(roomId: string, month: Date): boolean {
    return bookings.some((b) => {
      const start = new Date(b.startMonth);
      return b.roomId === roomId &&
        start.getFullYear() === month.getFullYear() &&
        start.getMonth() === month.getMonth();
    });
  }

  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Booking Calendar</h2>
          <p className="text-sm text-zinc-500">Occupancy by room</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
          >
            Today
          </button>
          <button
            onClick={prev}
            className="p-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 transition"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-600" />
          </button>
          <button
            onClick={next}
            className="p-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 transition"
          >
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Room color legend */}
      <div className="flex flex-wrap gap-3">
        {rooms.map((room, i) => {
          const color = ROOM_COLORS[i % ROOM_COLORS.length];
          return (
            <div key={room.id} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${color.bg}`} />
              <span className="text-xs text-zinc-500">{room.name}</span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-zinc-400 py-2 pr-4 w-36">Room</th>
              {months.map((m) => {
                const isCurrent =
                  m.getFullYear() === thisMonth.getFullYear() &&
                  m.getMonth() === thisMonth.getMonth();
                return (
                  <th
                    key={m.toISOString()}
                    className={`text-center text-xs font-medium py-2 px-1 ${
                      isCurrent ? "text-primary font-semibold" : "text-zinc-400"
                    }`}
                  >
                    {m.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rooms.map((room) => {
              const color = roomColorMap[room.id];
              return (
                <tr key={room.id} className="group">
                  <td className="py-2 pr-4">
                    <span className="text-sm font-medium text-zinc-700 truncate block max-w-[130px]">
                      {room.name}
                    </span>
                  </td>
                  {months.map((month) => {
                    const booking = getBooking(room.id, month);
                    const isStart = booking && isBookingStart(room.id, month);
                    const isCurrent =
                      month.getFullYear() === thisMonth.getFullYear() &&
                      month.getMonth() === thisMonth.getMonth();

                    return (
                      <td
                        key={month.toISOString()}
                        className={`py-1.5 px-0.5 ${isCurrent ? "bg-primary/5" : ""}`}
                      >
                        {booking ? (
                          <div
                            className={`
                              h-8 rounded-md flex items-center px-2
                              ${color.light} ${color.text} ${color.border} border
                              ${isStart ? "rounded-l-full" : "rounded-l-none border-l-0"}
                            `}
                            title={booking.guestName}
                          >
                            {isStart && (
                              <span className="text-xs font-medium truncate">
                                {booking.guestName.split(" ")[0]}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-8 rounded-md bg-zinc-50 border border-zinc-100" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {bookings.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-4">No bookings yet.</p>
      )}
    </div>
  );
}
