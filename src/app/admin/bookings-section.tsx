"use client";

import { useState } from "react";
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

interface BookingsSectionProps {
  rooms: Room[];
  bookings: Booking[];
}

export function BookingsSection({ rooms, bookings }: BookingsSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Bookings</h2>
          <p className="text-sm text-zinc-500">{bookings.length} total</p>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-full px-5">
          <Plus className="h-4 w-4 mr-1.5" />
          New booking
        </Button>
      </div>

      <BookingList bookings={bookings} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New booking</DialogTitle>
          </DialogHeader>
          <BookingForm
            rooms={rooms}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
