import { getRooms } from "@/lib/actions";
import Link from "next/link";
import { Euro, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Curated Unsplash bedroom photos (free, no API key needed)
const roomImages = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", // bright balcony bedroom
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80", // warm cozy bedroom
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80", // luxury suite
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", // simple bright room
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80", // airy terrace room
];

export default async function DashboardPage() {
  const rooms = await getRooms();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthLabel = now.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const roomsWithStatus = rooms.map((room) => {
    for (const b of room.bookings) {
      const start = new Date(b.startMonth);
      const end = new Date(start);
      end.setMonth(end.getMonth() + b.durationMonths);
      if (start <= thisMonth && thisMonth < end) {
        return { ...room, occupied: true, currentGuest: b.guestName };
      }
    }
    return { ...room, occupied: false, currentGuest: undefined };
  });

  const occupiedCount = roomsWithStatus.filter((r) => r.occupied).length;
  const availableCount = rooms.length - occupiedCount;

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Hero — full viewport height */}
      <div className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Promenade des Anglais from Mont Boron */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/62/Nice_from_Castle_Hill_01.jpg"
          alt="Promenade des Anglais, Nice"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
        />

        {/* Layered overlay: darken top & bottom, lighter in middle */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-900/30 to-blue-950/80" />

        {/* Hero content — vertically centered */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-[0.25em] mb-5">
            Nice · Côte d&apos;Azur · France
          </p>
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight max-w-3xl">
            Your apartment<br />on the Riviera
          </h1>
          <p className="text-blue-100/90 text-lg sm:text-xl max-w-lg mb-10 leading-relaxed">
            Five rooms, steps from the Promenade des Anglais and the blue waters of the Mediterranean.
          </p>

          {/* Stats pill */}
          <div className="flex items-center gap-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-10 py-5 text-white">
            <div className="text-center">
              <p className="text-3xl font-bold">{rooms.length}</p>
              <p className="text-blue-200 text-[11px] uppercase tracking-widest mt-0.5">Rooms</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-300">{availableCount}</p>
              <p className="text-blue-200 text-[11px] uppercase tracking-widest mt-0.5">Available</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-red-300">{occupiedCount}</p>
              <p className="text-blue-200 text-[11px] uppercase tracking-widest mt-0.5">Occupied</p>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-white/50">
            <p className="text-xs uppercase tracking-widest">Scroll</p>
            <div className="w-px h-8 bg-white/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Month label */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-4">
        <h2 className="text-xl font-bold text-zinc-900">
          Occupancy — <span className="text-primary">{monthLabel}</span>
        </h2>
      </div>

      {/* Room grid */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomsWithStatus.map((room, i) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-200 hover:shadow-md transition-shadow group"
            >
              {/* Room photo */}
              <div className="relative h-44 overflow-hidden bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={roomImages[i % roomImages.length]}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Badge
                    className={
                      room.occupied
                        ? "bg-red-500/90 text-white border-0 backdrop-blur-sm text-xs"
                        : "bg-emerald-500/90 text-white border-0 backdrop-blur-sm text-xs"
                    }
                  >
                    {room.occupied ? "Occupied" : "Available"}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-zinc-900 text-[15px] leading-tight mb-1">
                  {room.name}
                </h3>
                {room.description && (
                  <p className="text-zinc-500 text-xs line-clamp-2 mb-4">
                    {room.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                  <div className="flex items-center gap-1 text-zinc-900 font-bold text-sm">
                    <Euro className="h-3.5 w-3.5" />
                    <span>{room.monthlyPrice}</span>
                    <span className="text-zinc-400 font-normal text-xs ml-0.5">/ mo</span>
                  </div>
                  {room.occupied && room.currentGuest ? (
                    <div className="flex items-center gap-1 text-zinc-500 text-xs">
                      <Users className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[110px]">{room.currentGuest}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      View details →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
