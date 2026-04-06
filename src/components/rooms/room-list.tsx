"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, BedDouble, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RoomForm } from "./room-form";
import { deleteRoom } from "@/lib/actions";

type Room = {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  charges: number;
  imageUrl?: string | null;
  bookings: { id: string }[];
};

export function RoomList({ rooms }: { rooms: Room[] }) {
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(room: Room) {
    if (room.bookings.length > 0) {
      alert(
        `Cannot delete "${room.name}" — it has ${room.bookings.length} active booking(s). Cancel all bookings first.`
      );
      return;
    }
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    setDeleting(room.id);
    await deleteRoom(room.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rooms</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{rooms.length} rooms in this property</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-full px-5">
          <Plus className="h-4 w-4 mr-1.5" />
          Add room
        </Button>
      </div>

      {/* Room cards */}
      <div className="space-y-3">
        {rooms.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            No rooms yet. Add your first room above.
          </div>
        )}
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl border border-zinc-200 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center">
              {room.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-5 w-5 text-zinc-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-zinc-900 text-sm">{room.name}</h3>
                {room.bookings.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {room.bookings.length} booking{room.bookings.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              {room.description && (
                <p className="text-zinc-500 text-xs truncate">{room.description}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold text-zinc-900 text-sm">€{room.monthlyPrice}</p>
              <p className="text-zinc-400 text-xs">
                {room.charges > 0 ? `+ €${room.charges} charges` : "/ month"}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditRoom(room)}
                className="rounded-full h-8 w-8 text-zinc-400 hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(room)}
                disabled={deleting === room.id}
                className="rounded-full h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editRoom} onOpenChange={(o) => !o && setEditRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit room</DialogTitle>
          </DialogHeader>
          {editRoom && (
            <RoomForm room={editRoom} onSuccess={() => setEditRoom(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a room</DialogTitle>
          </DialogHeader>
          <RoomForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
