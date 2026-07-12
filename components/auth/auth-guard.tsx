"use client"

import { LoadingScreen } from "@/components/loading-screen"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.replace("/login")
      return
    }
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) return <LoadingScreen message="Checking authentication..." />

  return children
}
