import { getRooms } from "@/lib/actions";
import { RoomList } from "@/components/rooms/room-list";

export default async function RoomsPage() {
  const rooms = await getRooms();
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
            Nice, Côte d&apos;Azur
          </p>
          <h1 className="text-3xl font-bold text-zinc-900">Property Management</h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <RoomList rooms={rooms} />
      </div>
    </main>
  );
}
