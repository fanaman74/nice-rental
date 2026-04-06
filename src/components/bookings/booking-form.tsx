"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkAvailability, createBooking } from "@/lib/actions";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type Room = { id: string; name: string; monthlyPrice: number };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getYearOptions() {
  const year = new Date().getFullYear();
  return [year - 1, year, year + 1, year + 2];
}

interface BookingFormProps {
  rooms: Room[];
  onSuccess: () => void;
}

export function BookingForm({ rooms, onSuccess }: BookingFormProps) {
  const now = new Date();
  const [roomId, setRoomId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [month, setMonth] = useState(String(now.getMonth()));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [duration, setDuration] = useState("1");
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheckAvailability() {
    if (!roomId) return;
    setCheckingAvail(true);
    setAvailability(null);
    const startDate = new Date(parseInt(year), parseInt(month), 1);
    const result = await checkAvailability(roomId, startDate, parseInt(duration));
    setAvailability(result);
    setCheckingAvail(false);
  }

  function handleDateChange(setter: (v: string) => void) {
    return (v: string | null) => {
      if (v !== null) setter(v);
      setAvailability(null);
    };
  }

  function handleRoomChange(id: string | null) {
    if (!id) return;
    setRoomId(id);
    setAvailability(null);
    // Pre-fill deposit with 1 month's rent
    const room = rooms.find((r) => r.id === id);
    if (room && !depositAmount) setDepositAmount(String(room.monthlyPrice));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!roomId) return setError("Please select a room.");
    if (!guestName.trim()) return setError("Guest name is required.");
    if (!guestEmail.trim() || !guestEmail.includes("@")) return setError("Valid email is required.");
    if (availability === null) return setError("Please check availability first.");
    if (availability === false) return setError("This room is not available for the selected period.");

    setLoading(true);
    const startDate = new Date(parseInt(year), parseInt(month), 1);
    const result = await createBooking({
      roomId,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      phone: phone.trim() || undefined,
      startMonth: startDate,
      durationMonths: parseInt(duration),
      depositAmount: depositAmount ? parseInt(depositAmount) : undefined,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onSuccess();
  }

  const years = getYearOptions();
  const selectedRoom = rooms.find((r) => r.id === roomId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Room */}
      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-medium">Room</Label>
        <Select value={roomId} onValueChange={handleRoomChange}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a room…" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} — €{r.monthlyPrice}/mo
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRoom && (
          <p className="text-xs text-primary font-medium">€{selectedRoom.monthlyPrice} / month</p>
        )}
      </div>

      {/* Month & Year */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-zinc-700 font-medium">Start month</Label>
          <Select value={month} onValueChange={handleDateChange(setMonth)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue>{MONTHS[parseInt(month)]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-700 font-medium">Year</Label>
          <Select value={year} onValueChange={handleDateChange(setYear)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label className="text-zinc-700 font-medium">Duration</Label>
        <Select value={duration} onValueChange={handleDateChange(setDuration)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 9, 12].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} month{n > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability check */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!roomId || checkingAvail}
          onClick={handleCheckAvailability}
          className="rounded-full"
        >
          {checkingAvail ? "Checking…" : "Check availability"}
        </Button>
        {availability === true && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Available
          </span>
        )}
        {availability === false && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
            <AlertCircle className="h-4 w-4" /> Not available
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-100" />

      {/* Guest details */}
      <div className="space-y-1.5">
        <Label htmlFor="guestName" className="text-zinc-700 font-medium">Guest name</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Jean Dupont"
          className="rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="guestEmail" className="text-zinc-700 font-medium">Email</Label>
          <Input
            id="guestEmail"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="jean@example.com"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-zinc-700 font-medium">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Security deposit */}
      <div className="space-y-1.5">
        <Label htmlFor="deposit" className="text-zinc-700 font-medium">
          Security deposit (€)
          <span className="text-zinc-400 font-normal ml-1">— dépôt de garantie</span>
        </Label>
        <Input
          id="deposit"
          type="number"
          min={0}
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="0"
          className="rounded-xl"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-zinc-700 font-medium">
          Notes
          <span className="text-zinc-400 font-normal ml-1">— optional</span>
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Key handover, contract type, special arrangements…"
          rows={2}
          className="rounded-xl resize-none"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={loading || availability !== true}
          className="rounded-full px-6"
        >
          {loading ? "Booking…" : "Confirm booking"}
        </Button>
      </div>
    </form>
  );
}
