import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "BLOCK":
      return "bg-red-100 text-red-800"
    case "ACTIVE":
      return "bg-green-100 text-green-800"
    case "NEW":
      return "bg-blue-100 text-blue-800"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
