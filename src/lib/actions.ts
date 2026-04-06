"use server";

import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomRow = {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  charges: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingRow = {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  phone: string | null;
  startMonth: string;
  durationMonths: number;
  depositAmount: number;
  depositPaid: boolean;
  depositReturned: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getRooms() {
  const { data, error } = await supabase
    .from("Room")
    .select("*, bookings:Booking(*)")
    .order("name");
  if (error) throw error;
  return data as (RoomRow & { bookings: BookingRow[] })[];
}

export async function getRoom(id: string) {
  const { data, error } = await supabase
    .from("Room")
    .select("*, bookings:Booking(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as RoomRow & { bookings: BookingRow[] };
}

export async function uploadRoomImage(roomId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${roomId}.${ext}`;
  const { error } = await supabase.storage
    .from("room-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("room-images").getPublicUrl(path);
  // Add cache-buster so re-uploads show immediately
  const url = `${data.publicUrl}?t=${Date.now()}`;
  await supabase.from("Room").update({ imageUrl: url }).eq("id", roomId);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/rooms/${roomId}`);
  return url;
}

export async function createRoom(data: {
  name: string;
  description?: string;
  monthlyPrice: number;
  charges?: number;
}) {
  const { data: room, error } = await supabase
    .from("Room")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/rooms");
  revalidatePath("/admin");
  revalidatePath("/");
  return room as RoomRow;
}

export async function updateRoom(
  id: string,
  data: { name?: string; description?: string; monthlyPrice?: number; charges?: number; imageUrl?: string }
) {
  const { data: room, error } = await supabase
    .from("Room")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/rooms");
  revalidatePath("/admin");
  revalidatePath("/");
  return room as RoomRow;
}

export async function deleteRoom(id: string) {
  const { error } = await supabase.from("Room").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/rooms");
  revalidatePath("/admin");
  revalidatePath("/");
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings() {
  const { data, error } = await supabase
    .from("Booking")
    .select("*, room:Room(name)")
    .order("startMonth", { ascending: false });
  if (error) throw error;
  return data as (BookingRow & { room: { name: string } })[];
}

export async function deleteBooking(id: string) {
  const { error } = await supabase.from("Booking").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bookings");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function markDepositPaid(id: string) {
  const { error } = await supabase
    .from("Booking")
    .update({ depositPaid: true })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/bookings");
  revalidatePath("/admin");
}

export async function markDepositReturned(id: string) {
  const { error } = await supabase
    .from("Booking")
    .update({ depositReturned: true })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/bookings");
  revalidatePath("/admin");
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function checkAvailability(
  roomId: string,
  startMonth: Date,
  durationMonths: number
): Promise<boolean> {
  const newEnd = addMonths(startMonth, durationMonths);

  const { data: conflicts, error } = await supabase
    .from("Booking")
    .select("startMonth, durationMonths")
    .eq("roomId", roomId);
  if (error) throw error;

  for (const b of conflicts) {
    const existingStart = new Date(b.startMonth);
    const existingEnd = addMonths(existingStart, b.durationMonths);
    if (existingStart < newEnd && startMonth < existingEnd) {
      return false;
    }
  }
  return true;
}

// ─── Create Booking ───────────────────────────────────────────────────────────

export async function createBooking(data: {
  roomId: string;
  guestName: string;
  guestEmail: string;
  phone?: string;
  startMonth: Date;
  durationMonths: number;
  depositAmount?: number;
  notes?: string;
}): Promise<{ success: true; booking: BookingRow } | { success: false; error: string }> {
  const available = await checkAvailability(
    data.roomId,
    data.startMonth,
    data.durationMonths
  );

  if (!available) {
    return {
      success: false,
      error: "This room is already booked for the selected period.",
    };
  }

  const { data: booking, error } = await supabase
    .from("Booking")
    .insert(data)
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/bookings");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, booking: booking as BookingRow };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
