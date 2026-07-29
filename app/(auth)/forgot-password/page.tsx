"use client"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForgotPasswordMutation } from "@/lib/redux/services/authApis"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim()
    try {
      const response = await forgotPassword({ email }).unwrap()
      sessionStorage.setItem("resetEmail", email)
      toast.success(response?.message || "Verification code sent")
      router.push("/otp-verification")
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Unable to send verification code")
    }
  }

  return <AuthCard title="Forgot password" description="Enter your email and we’ll send you a verification code.">
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
      </div>
      <Button className="w-full bg-[#00ACA7] hover:bg-[#009b96]" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send verification code"}
      </Button>
    </form>
  </AuthCard>
}
