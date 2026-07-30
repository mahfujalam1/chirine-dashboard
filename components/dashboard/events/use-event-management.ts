"use client"

import { useCreateCoffeConnectMutation, useDeleteCoffeConnectMutation, useGetCoffeConnectQuery, useUpdateCoffeConnectMutation } from "@/lib/redux/services/coffeConnectApis"
import { CreateEventPayload, UpdateEventPayload } from "@/lib/redux/services/eventApiHelpers"
import { useCreateLunchAndLearnMutation, useDeleteLunchAndLearnMutation, useGetLunchAndLearnQuery, useUpdateLunchAndLearnMutation } from "@/lib/redux/services/lunchAndLearnApis"
import { useCreateSocialEventMutation, useDeleteSocialEventMutation, useGetSocialEventQuery, useUpdateSocialEventMutation } from "@/lib/redux/services/socialEventApis"
import { EventFormData } from "@/components/dashboard/EventForm"
import { EventRow, EventType, normalizeEvent } from "@/components/dashboard/events/types"
import { useMemo } from "react"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/utils"

interface ApiResponse { message?: string }

export function useEventManagement(type: EventType) {
  const coffeeQuery = useGetCoffeConnectQuery(undefined, { skip: type !== "coffee" })
  const socialQuery = useGetSocialEventQuery(undefined, { skip: type !== "social" })
  const lunchQuery = useGetLunchAndLearnQuery(undefined, { skip: type !== "lunch" })
  const query = type === "coffee" ? coffeeQuery : type === "social" ? socialQuery : lunchQuery

  const [createCoffee, createCoffeeState] = useCreateCoffeConnectMutation()
  const [createSocial, createSocialState] = useCreateSocialEventMutation()
  const [createLunch, createLunchState] = useCreateLunchAndLearnMutation()
  const [updateCoffee, updateCoffeeState] = useUpdateCoffeConnectMutation()
  const [updateSocial, updateSocialState] = useUpdateSocialEventMutation()
  const [updateLunch, updateLunchState] = useUpdateLunchAndLearnMutation()
  const [deleteCoffee, deleteCoffeeState] = useDeleteCoffeConnectMutation()
  const [deleteSocial, deleteSocialState] = useDeleteSocialEventMutation()
  const [deleteLunch, deleteLunchState] = useDeleteLunchAndLearnMutation()

  const rows = useMemo(() => (query.data?.data ?? []).map(normalizeEvent), [query.data])
  const isSaving = createCoffeeState.isLoading || createSocialState.isLoading || createLunchState.isLoading || updateCoffeeState.isLoading || updateSocialState.isLoading || updateLunchState.isLoading
  const isDeleting = deleteCoffeeState.isLoading || deleteSocialState.isLoading || deleteLunchState.isLoading

  function toPayload(data: EventFormData): UpdateEventPayload {
    return {
      eventImage: data.eventImage,
      title: data.title.trim(),
      description: data.description.trim(),
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location.trim(),
    }
  }

  async function save(data: EventFormData, event: EventRow | null) {
    try {
      const payload = toPayload(data)
      let response: ApiResponse
      if (event) {
        response = type === "coffee" ? await updateCoffee({ eventId: event.id, data: payload }).unwrap() as ApiResponse
          : type === "social" ? await updateSocial({ eventId: event.id, data: payload }).unwrap() as ApiResponse
          : await updateLunch({ eventId: event.id, data: payload }).unwrap() as ApiResponse
      } else {
        if (!data.eventImage) { toast.error("Please select an event image"); return false }
        const createPayload = payload as CreateEventPayload
        response = data.event_type === "coffee_connect" ? await createCoffee(createPayload).unwrap() as ApiResponse
          : data.event_type === "social_event" ? await createSocial(createPayload).unwrap() as ApiResponse
          : await createLunch(createPayload).unwrap() as ApiResponse
      }
      toast.success(response.message || `Event ${event ? "updated" : "created"} successfully`)
      return true
    } catch (error: unknown) { toast.error(getErrorMessage(error, "Unable to save event")); return false }
  }

  async function remove(event: EventRow) {
    try {
      const response = type === "coffee" ? await deleteCoffee(event.id).unwrap() as ApiResponse
        : type === "social" ? await deleteSocial(event.id).unwrap() as ApiResponse
        : await deleteLunch(event.id).unwrap() as ApiResponse
      toast.success(response.message || "Event deleted successfully")
      return true
    } catch (error: unknown) { toast.error(getErrorMessage(error, "Unable to delete event")); return false }
  }

  return { rows, query, isSaving, isDeleting, save, remove }
}
