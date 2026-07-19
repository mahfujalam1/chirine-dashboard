import { CoffeConnectEvent } from "@/app/redux-query/services/coffeConnectApis"
import { LunchAndLearnEvent } from "@/app/redux-query/services/lunchAndLearnApis"
import { SocialEvent } from "@/app/redux-query/services/socialEventApis"

export type EventType = "coffee" | "social" | "lunch"
export type EventRecord = CoffeConnectEvent | SocialEvent | LunchAndLearnEvent

export interface EventTab {
  value: EventType
  label: string
  formType: "coffee_connect" | "social_event" | "lunch_and_learn"
}

export interface EventRow {
  id: string
  image: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  participants: number
  maxParticipants: number
  requirements: string[]
  isExpired: boolean
  zoomJoinUrl?: string
  source: EventRecord
}

export const EVENT_TABS: EventTab[] = [
  { value: "coffee", label: "Coffee Connect", formType: "coffee_connect" },
  { value: "social", label: "Social Events", formType: "social_event" },
  { value: "lunch", label: "Lunch & Learn", formType: "lunch_and_learn" },
]

export function normalizeEvent(event: EventRecord): EventRow {
  return {
    id: event._id,
    image: event.image,
    title: event.title,
    description: event.description,
    date: event.date,
    time: `${event.startTime} – ${event.endTime}`,
    venue: "location" in event ? event.location : "Zoom",
    participants: event.participants.length,
    maxParticipants: event.maxParticipants,
    requirements: "entryRequirements" in event ? event.entryRequirements : [],
    isExpired: event.isExpired,
    zoomJoinUrl: "zoomJoinUrl" in event ? event.zoomJoinUrl : undefined,
    source: event,
  }
}

export function isSocialEvent(event: EventRecord): event is SocialEvent {
  return "location" in event && "entryRequirements" in event
}
