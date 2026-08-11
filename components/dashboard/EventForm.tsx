"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventFormProps {
  initial?: EventFormData;
  onSubmit: (data: EventFormData) => void | Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
  existingImage?: string;
}

interface Event {
  id: string;
  title: string;
  event_image?: string;
  eventImage?: File;
  event_type: "coffee_connect" | "social_event" | "lunch_and_learn";
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location: string;
  entryRequirements: string[];
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  requested_by?: string;
  proposed_date?: string;
  idea?: string;
}

export type EventFormData = Omit<
  Event,
  "id" | "status" | "requested_by" | "proposed_date" | "idea"
>;

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const EMPTY_FORM: EventFormData = {
  title: "",
  event_type: "coffee_connect",
  date: "",
  start_time: "",
  end_time: "",
  timezone: typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC",
  location: "",
  entryRequirements: [],
  description: "",
};

export function EventForm({
  initial = EMPTY_FORM,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting = false,
  existingImage,
}: EventFormProps) {
  const [form, setForm] = useState<EventFormData>(() => ({
    ...EMPTY_FORM,
    ...initial,
    entryRequirements: initial.entryRequirements ?? [],
  }));
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(existingImage ?? "");
  const [requirementInput, setRequirementInput] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isEdit && !form.eventImage) {
      setError("Please select an event image.");
      return;
    }
    if (!form.timezone) {
      setError("Timezone is required.");
      return;
    }
    if (form.end_time <= form.start_time) {
      setError("End time must be later than start time.");
      return;
    }

    const pendingRequirement = requirementInput.trim();
    const shouldIncludePendingRequirement =
      form.event_type === "social_event" &&
      pendingRequirement.length > 0 &&
      !form.entryRequirements.some(
        (item) => item.toLowerCase() === pendingRequirement.toLowerCase(),
      );

    await onSubmit(
      shouldIncludePendingRequirement
        ? {
            ...form,
            entryRequirements: [
              ...form.entryRequirements,
              pendingRequirement,
            ],
          }
        : form,
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      set("eventImage", undefined);
      setImagePreview(existingImage ?? "");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      e.target.value = "";
      set("eventImage", undefined);
      setImagePreview(existingImage ?? "");
      setError("Event image must be 5 MB or smaller.");
      return;
    }
    setError("");
    set("eventImage", file);
    setImagePreview(URL.createObjectURL(file));
  }

  function addEntryRequirement() {
    const requirement = requirementInput.trim();
    if (!requirement) return;

    const alreadyExists = form.entryRequirements.some(
      (item) => item.toLowerCase() === requirement.toLowerCase(),
    );
    if (alreadyExists) {
      setError("This entry requirement has already been added.");
      return;
    }

    set("entryRequirements", [...form.entryRequirements, requirement]);
    setRequirementInput("");
    setError("");
  }

  function removeEntryRequirement(index: number) {
    set(
      "entryRequirements",
      form.entryRequirements.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Morning Brew & Chat"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      {/* Event Type */}
      <div className="space-y-1.5">
        <Label>
          Event Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.event_type}
          onValueChange={(v) =>
            set("event_type", v as EventFormData["event_type"])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coffee_connect">Coffee Connect</SelectItem>
            <SelectItem value="social_event">Social Event</SelectItem>
            <SelectItem value="lunch_and_learn">HotCast</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.event_type === "social_event" && (
        <div className="space-y-2">
          <Label htmlFor="entry_requirement">Entry Requirements</Label>
          <div className="flex gap-2">
            <Input
              id="entry_requirement"
              placeholder="e.g. ID Card"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEntryRequirement();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addEntryRequirement}
              disabled={!requirementInput.trim()}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add each item separately. Press Enter or select Add.
          </p>
          {form.entryRequirements.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-3">
              {form.entryRequirements.map((requirement, index) => (
                <span
                  key={`${requirement}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-sm"
                >
                  {requirement}
                  <button
                    type="button"
                    className="rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => removeEntryRequirement(index)}
                    aria-label={`Remove ${requirement}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="event_image">
          Event Image {!isEdit && <span className="text-destructive">*</span>}
        </Label>
        {imagePreview && (
          <div className="overflow-hidden rounded border bg-muted">
            <Image
              src={imagePreview}
              alt="Event image preview"
              width={600}
              height={200}
              className="h-48 w-full object-cover"
            />
          </div>
        )}
        <Input
          id="event_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          required={!isEdit}
        />
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? "Select a new image only if you want to replace the current one. "
            : ""}
          JPEG, PNG, or WebP; maximum 5 MB.
        </p>
      </div>

      {/* Date + Location */}
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-1.5">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            placeholder="e.g. Room 3B, HQ"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Start / End time */}
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-1.5">
          <Label htmlFor="start_time">
            Start Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="start_time"
            type="time"
            value={form.start_time}
            onChange={(e) => set("start_time", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_time">
            End Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="end_time"
            type="time"
            value={form.end_time}
            onChange={(e) => set("end_time", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-1.5">
        <Label htmlFor="timezone">
          Timezone <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.timezone || (typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC")}
          onValueChange={(v) => set("timezone", v)}
        >
          <SelectTrigger className="w-full" id="timezone">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {Array.from(
              new Set([
                form.timezone || (typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"),
                ...COMMON_TIMEZONES,
              ].filter(Boolean))
            ).map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the event..."
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-(--color-primary)"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
              ? "Save Changes"
              : "Create Event"}
        </Button>
      </DialogFooter>
    </form>
  );
}
