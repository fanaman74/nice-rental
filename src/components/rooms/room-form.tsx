"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRoom, updateRoom } from "@/lib/actions";

interface RoomFormProps {
  room?: {
    id: string;
    name: string;
    description: string | null;
    monthlyPrice: number;
    charges: number;
  };
  onSuccess: () => void;
}

export function RoomForm({ room, onSuccess }: RoomFormProps) {
  const [name, setName] = useState(room?.name ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [monthlyPrice, setMonthlyPrice] = useState(
    room?.monthlyPrice?.toString() ?? ""
  );
  const [charges, setCharges] = useState(room?.charges?.toString() ?? "0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const price = parseInt(monthlyPrice, 10);
    const chargesVal = parseInt(charges, 10) || 0;
    if (!name.trim()) return setError("Name is required.");
    if (isNaN(price) || price <= 0) return setError("Enter a valid price.");

    setLoading(true);
    try {
      if (room) {
        await updateRoom(room.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          monthlyPrice: price,
          charges: chargesVal,
        });
      } else {
        await createRoom({
          name: name.trim(),
          description: description.trim() || undefined,
          monthlyPrice: price,
          charges: chargesVal,
        });
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-zinc-700 font-medium">Room name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Promenade des Anglais"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-zinc-700 font-medium">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the room…"
          rows={3}
          className="rounded-xl resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="price" className="text-zinc-700 font-medium">Monthly rent (€)</Label>
          <Input
            id="price"
            type="number"
            min={1}
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(e.target.value)}
            placeholder="800"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="charges" className="text-zinc-700 font-medium">
            Charges (€)
            <span className="text-zinc-400 font-normal ml-1 text-xs">/ mo</span>
          </Label>
          <Input
            id="charges"
            type="number"
            min={0}
            value={charges}
            onChange={(e) => setCharges(e.target.value)}
            placeholder="0"
            className="rounded-xl"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} className="rounded-full px-6">
          {loading ? "Saving…" : room ? "Save changes" : "Create room"}
        </Button>
      </div>
    </form>
  );
}
