import { getRoom } from "@/lib/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Euro, CalendarDays, BedDouble } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoomGallery } from "@/components/rooms/room-gallery";

// Confirmed-working Unsplash bedroom photo IDs (verified from room cards)
const BEDROOM_PHOTOS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80",
  // wider crops of the same photos for variety
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&fit=crop&crop=bottom",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80&fit=crop&crop=right",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&fit=crop&crop=entropy",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80&fit=crop&crop=top",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&fit=crop&crop=left",
];

// Each room gets 4 unique photos, offset by gallery index
const GALLERY_SETS = [0, 1, 2, 3, 4].map((offset) =>
  [0, 1, 2, 3].map((i) => BEDROOM_PHOTOS[(offset + i) % BEDROOM_PHOTOS.length])
);

function isCurrentlyOccupied(bookings: { startMonth: string | Date; durationMonths: number }[]) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  for (const b of bookings) {
    const start = new Date(b.startMonth);
    const end = new Date(start);
    end.setMonth(end.getMonth() + b.durationMonths);
    if (start <= thisMonth && thisMonth < end) return true;
  }
  return false;
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();

  // Determine gallery set by hashing room name to an index
  const galleryIndex =
    room.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    GALLERY_SETS.length;
  const images = GALLERY_SETS[galleryIndex];

  const occupied = isCurrentlyOccupied(room.bookings);

  const upcomingBookings = room.bookings
    .filter((b) => {
      const start = new Date(b.startMonth);
      const now = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + b.durationMonths);
      return end > now;
    })
    .sort((a, b) => new Date(a.startMonth).getTime() - new Date(b.startMonth).getTime());

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <Badge
            className={
              occupied
                ? "bg-red-100 text-red-600 border-red-200"
                : "bg-emerald-100 text-emerald-700 border-emerald-200"
            }
          >
            {occupied ? "Occupied this month" : "Available"}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Room title */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">{room.name}</h1>
          <p className="text-zinc-500 text-sm">Nice, Côte d&apos;Azur · France</p>
        </div>

        {/* Gallery — Airbnb-style: 1 large left + 3 smaller right */}
        <RoomGallery images={images} roomName={room.name} />

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: description + bookings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BedDouble className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-zinc-900">About this room</h2>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                {room.description ?? "No description provided."}
              </p>
            </div>

            {/* Upcoming bookings */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-zinc-900">
                  Upcoming bookings ({upcomingBookings.length})
                </h2>
              </div>
              {upcomingBookings.length === 0 ? (
                <p className="text-zinc-400 text-sm">No upcoming bookings.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((b) => {
                    const start = new Date(b.startMonth);
                    const end = new Date(start);
                    end.setMonth(end.getMonth() + b.durationMonths - 1);
                    return (
                      <div key={b.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{b.guestName}</p>
                          <p className="text-xs text-zinc-400">{b.guestEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-700">
                            {start.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                            {" → "}
                            {end.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-zinc-400">{b.durationMonths} month{b.durationMonths > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: price card + CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 sticky top-36 space-y-5">
              <div className="flex items-baseline gap-1">
                <Euro className="h-5 w-5 text-zinc-900" />
                <span className="text-3xl font-bold text-zinc-900">{room.monthlyPrice}</span>
                <span className="text-zinc-400 text-sm">/ month</span>
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2 text-sm text-zinc-600">
                {room.charges > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Charges</span>
                      <span className="font-medium text-zinc-900">+ €{room.charges} / mo</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-zinc-900">Total</span>
                      <span className="text-zinc-900">€{room.monthlyPrice + room.charges} / mo</span>
                    </div>
                    <div className="border-t border-zinc-100 pt-2" />
                  </>
                )}
                <div className="flex justify-between">
                  <span>Min. stay</span>
                  <span className="font-medium text-zinc-900">1 month</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-medium text-zinc-900">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-medium text-zinc-900">Nice, France</span>
                </div>
              </div>

              <Link href="/bookings">
                <Button className="w-full rounded-xl py-5 text-base" disabled={occupied}>
                  {occupied ? "Currently occupied" : "Book this room"}
                </Button>
              </Link>

              {!occupied && (
                <p className="text-xs text-center text-zinc-400">
                  You won&apos;t be charged yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
