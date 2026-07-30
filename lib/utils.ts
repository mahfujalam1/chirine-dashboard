import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
