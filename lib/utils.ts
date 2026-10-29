import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Reads a reference the API sends either populated (`{ _id, name }`) or as a bare id. */
export const getRefName = (
  value?: { _id?: string; name?: string } | string | null,
): string | null => {
  if (!value) return null
  if (typeof value === "string") return value
  return value.name ?? null
}

/** Joins the parts of an address that are present, e.g. "Ottawa, Ontario, Canada". */
export const formatLocation = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(", ")

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "blocked":
      return "bg-red-100 text-red-800"
    case "active":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred."): string {
  if (typeof error !== "object" || error === null) return fallback
  const candidate = error as { data?: { message?: string }; message?: string }
  return candidate.data?.message || candidate.message || fallback
}
