"use client"

import { useVerifyForgotOtpMutation, useResendResetCodeMutation } from "@/app/redux-query/services/authApis"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function OtpVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [verifyOtp, { isLoading }] = useVerifyForgotOtpMutation()
  const [resendCode, { isLoading: isResending }] = useResendResetCodeMutation()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail")
    if (!storedEmail) return router.replace("/forgot-password")
    setEmail(storedEmail)
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const otp = String(new FormData(event.currentTarget).get("otp") ?? "").trim()
    try {
      const response = await verifyOtp({ email, otp }).unwrap()
      const resetToken = response?.data?.resetToken || response?.data?.token
      if (resetToken) sessionStorage.setItem("resetToken", resetToken)
      toast.success(response?.message || "Code verified")
      router.push("/reset-password")
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Invalid verification code")
    }
  }

  async function handleResend() {
    try {
      const response = await resendCode({ email }).unwrap()
      toast.success(response?.message || "A new code was sent")
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Unable to resend code")
    }
  }

  return <AuthCard title="Verify your code" description={`Enter the verification code sent to ${email || "your email"}.`}>
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="otp">Verification code</Label>
        <Input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" required autoFocus className="text-center text-xl tracking-[0.4em]" />
      </div>
      <Button className="w-full bg-[#00ACA7] hover:bg-[#009b96]" disabled={isLoading || !email}>
        {isLoading ? "Verifying..." : "Verify code"}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={handleResend} disabled={isResending || !email}>
        {isResending ? "Sending..." : "Resend code"}
      </Button>
    </form>
  </AuthCard>
}
