"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/booking-form";
import { BookingList } from "@/components/bookings/booking-list";
import { getRooms, getBookings } from "@/lib/actions";

type Room = { id: string; name: string; monthlyPrice: number };
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

export default function BookingsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const [r, b] = await Promise.all([getRooms(), getBookings()]);
    setRooms(r.map((room) => ({ id: room.id, name: room.name, monthlyPrice: room.monthlyPrice })));
    setBookings(b as Booking[]);
  }

  useEffect(() => { load(); }, []);

  const activeCount = bookings.filter((b) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(b.startMonth);
    const end = new Date(start);
    end.setMonth(end.getMonth() + b.durationMonths);
    return start <= thisMonth && thisMonth < end;
  }).length;

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
            Nice, Côte d&apos;Azur
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-1">Bookings</h1>
              <p className="text-zinc-500 text-base">
                {bookings.length} total &middot;{" "}
                <span className="text-primary font-medium">{activeCount} active this month</span>
              </p>
            </div>
            <Button onClick={() => setOpen(true)} className="rounded-full px-5 shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />
              New booking
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <BookingList bookings={bookings} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New booking</DialogTitle>
          </DialogHeader>
          <BookingForm
            rooms={rooms}
            onSuccess={() => {
              setOpen(false);
              load();
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
