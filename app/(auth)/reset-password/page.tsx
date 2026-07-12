"use client"

import { useResetPasswordMutation } from "@/app/redux-query/services/authApis"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail")
    if (!storedEmail) return router.replace("/forgot-password")
    setEmail(storedEmail)
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")
    if (password !== confirmPassword) return toast.error("Passwords do not match")
    if (password.length < 8) return toast.error("Password must be at least 8 characters")

    try {
      const resetToken = sessionStorage.getItem("resetToken")
      const response = await resetPassword({ email, password, confirmPassword, ...(resetToken && { resetToken }) }).unwrap()
      sessionStorage.removeItem("resetEmail")
      sessionStorage.removeItem("resetToken")
      toast.success(response?.message || "Password reset successfully")
      router.replace("/login")
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Unable to reset password")
    }
  }

  return <AuthCard title="Set new password" description="Choose a strong password you haven’t used before.">
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={8} required autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
      </div>
      <Button className="w-full bg-[#00ACA7] hover:bg-[#009b96]" disabled={isLoading || !email}>
        {isLoading ? "Updating..." : "Reset password"}
      </Button>
    </form>
  </AuthCard>
}
