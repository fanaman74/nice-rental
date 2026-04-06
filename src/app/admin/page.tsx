import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "./auth";
import { getRooms, getBookings } from "@/lib/actions";
import { RoomList } from "@/components/rooms/room-list";
import { BookingsSection } from "./bookings-section";
import { Euro, BedDouble, TrendingUp, ShieldAlert } from "lucide-react";

function isActiveThisMonth(start: string | Date, duration: number): boolean {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const s = new Date(start);
  const end = new Date(s);
  end.setMonth(end.getMonth() + duration);
  return s <= thisMonth && thisMonth < end;
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const [rooms, bookings] = await Promise.all([getRooms(), getBookings()]);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Revenue stats
  const occupiedRooms = rooms.filter((r) =>
    r.bookings.some((b) => {
      const s = new Date(b.startMonth);
      const end = new Date(s);
      end.setMonth(end.getMonth() + b.durationMonths);
      return s <= thisMonth && thisMonth < end;
    })
  );

  const monthlyRevenue = occupiedRooms.reduce(
    (sum, r) => sum + r.monthlyPrice + (r.charges ?? 0),
    0
  );
  const potentialRevenue = rooms.reduce(
    (sum, r) => sum + r.monthlyPrice + (r.charges ?? 0),
    0
  );
  const occupancyRate =
    rooms.length > 0 ? Math.round((occupiedRooms.length / rooms.length) * 100) : 0;

  const depositsOutstanding = bookings.filter(
    (b) => b.depositAmount > 0 && !b.depositPaid
  ).length;

  const activeBookings = bookings.filter((b) =>
    isActiveThisMonth(b.startMonth, b.durationMonths)
  ).length;

  const monthLabel = now.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // Shape data for child components
  const roomsForList = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    monthlyPrice: r.monthlyPrice,
    charges: r.charges ?? 0,
    bookings: r.bookings.map((b) => ({ id: b.id })),
  }));

  const roomsForForm = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    monthlyPrice: r.monthlyPrice,
  }));

  const bookingsForList = bookings.map((b) => ({
    id: b.id,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    phone: b.phone,
    startMonth: b.startMonth,
    durationMonths: b.durationMonths,
    depositAmount: b.depositAmount,
    depositPaid: b.depositPaid,
    depositReturned: b.depositReturned,
    notes: b.notes,
    room: { name: b.room.name },
  }));

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
            Nice, Côte d&apos;Azur
          </p>
          <h1 className="text-3xl font-bold text-zinc-900">Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">{monthLabel}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-10">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-2 text-zinc-400 mb-3">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-widest">Revenue this month</span>
            </div>
            <p className="text-3xl font-bold text-zinc-900">€{monthlyRevenue.toLocaleString()}</p>
            <p className="text-xs text-zinc-400 mt-1">of €{potentialRevenue.toLocaleString()} potential</p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-2 text-zinc-400 mb-3">
              <BedDouble className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-widest">Occupancy</span>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{occupiedRooms.length}<span className="text-zinc-400 font-normal text-lg">/{rooms.length}</span></p>
            <p className="text-xs text-zinc-400 mt-1">{occupancyRate}% occupied this month</p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-2 text-zinc-400 mb-3">
              <Euro className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-widest">Active bookings</span>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{activeBookings}</p>
            <p className="text-xs text-zinc-400 mt-1">{bookings.length} total across all time</p>
          </div>

          <div className={`rounded-2xl border p-5 ${depositsOutstanding > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-zinc-200"}`}>
            <div className={`flex items-center gap-2 mb-3 ${depositsOutstanding > 0 ? "text-amber-500" : "text-zinc-400"}`}>
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-widest">Deposits pending</span>
            </div>
            <p className={`text-3xl font-bold ${depositsOutstanding > 0 ? "text-amber-700" : "text-zinc-900"}`}>
              {depositsOutstanding}
            </p>
            <p className={`text-xs mt-1 ${depositsOutstanding > 0 ? "text-amber-600" : "text-zinc-400"}`}>
              {depositsOutstanding > 0 ? "deposits not yet collected" : "all deposits collected"}
            </p>
          </div>
        </div>

        {/* Rooms section */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <RoomList rooms={roomsForList} />
        </div>

        {/* Bookings section */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <BookingsSection rooms={roomsForForm} bookings={bookingsForList} />
        </div>
      </div>
    </main>
  );
}
