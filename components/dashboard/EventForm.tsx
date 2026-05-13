"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import {
    DialogFooter,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventFormProps {
    initial?: EventFormData
    onSubmit: (data: EventFormData) => void
    onCancel: () => void
    isEdit?: boolean
}


interface Event {
    id: string
    title: string
    event_image?: string
    event_type: "coffee_connect" | "social_event" | "lunch_and_learn"
    date: string
    start_time: string
    end_time: string
    location: string
    description: string
    status: "Pending" | "Approved" | "Rejected"
    speaker_name?: string
    requested_by?: string
    proposed_date?: string
    idea?: string
}

type EventFormData = Omit<Event, "id" | "status" | "requested_by" | "proposed_date" | "idea">


const EMPTY_FORM: EventFormData = {
    title: "",
    event_type: "coffee_connect",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
    speaker_name: "",
}


export function EventForm({ initial = EMPTY_FORM, onSubmit, onCancel, isEdit }: EventFormProps) {
    const [form, setForm] = useState<EventFormData>(initial)

    function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
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
                <Label>Event Type <span className="text-destructive">*</span></Label>
                <Select value={form.event_type} onValueChange={(v) => set("event_type", v as EventFormData["event_type"])}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="coffee_connect">Coffee Connect</SelectItem>
                        <SelectItem value="social_event">Social Event</SelectItem>
                        <SelectItem value="lunch_and_learn">Lunch & Learn</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Speaker — only for L&L */}
            {form.event_type === "lunch_and_learn" && (
                <div className="space-y-1.5">
                    <Label htmlFor="speaker">Speaker Name <span className="text-destructive">*</span></Label>
                    <Input
                        id="speaker"
                        placeholder="e.g. Dr. Emily Rhodes"
                        value={form.speaker_name ?? ""}
                        onChange={(e) => set("speaker_name", e.target.value)}
                        required
                    />
                </div>
            )}

            {/* Date + Location */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                    <Input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(e) => set("date", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="start_time">Start Time <span className="text-destructive">*</span></Label>
                    <Input
                        id="start_time"
                        type="time"
                        value={form.start_time}
                        onChange={(e) => set("start_time", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="end_time">End Time <span className="text-destructive">*</span></Label>
                    <Input
                        id="end_time"
                        type="time"
                        value={form.end_time}
                        onChange={(e) => set("end_time", e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                    id="description"
                    placeholder="Describe the event..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    required
                />
            </div>

            <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" className="bg-(--color-primary)">
                    {isEdit ? "Save Changes" : "Create Event"}
                </Button>
            </DialogFooter>
        </form>
    )
}
