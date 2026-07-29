"use client";

import { useSignInMutation } from "@/app/redux-query/services/authApis";
import { LoadingScreen } from "@/components/loading-screen";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [signIn, { isLoading }] = useSignInMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };
      const res = await signIn(data).unwrap();
      if (!res?.success) {
        throw new Error(res?.message || "Login failed");
      }
      localStorage.setItem("accessToken", res?.data?.accessToken);
      toast.success(res?.message || "Sign in successful");
      router.push("/");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Sign in failed";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      {isLoading && <LoadingScreen message="Signing you in..." />}

      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900  border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-155">
        {/* Left Side: Brand Visual & Features Showcase */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-linear-to-br from-[#00ACA7] via-[#009691] to-[#007A76] p-10 flex-col justify-between text-white overflow-hidden">
          {/* Decorative background blur elements */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <Image
                src="/brand.svg"
                width={32}
                height={24}
                alt="MindShift Logo"
                className="brightness-0 invert"
              />
              <span className="font-semibold text-lg tracking-tight">
                MindShift
              </span>
            </div>
          </div>

          {/* Center Message */}
          <div className="relative z-10 my-auto py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-teal-50 mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Empowering Peer Support & Mindset Growth
            </h1>
            <p className="mt-3 text-teal-50/90 text-sm leading-relaxed">
              Manage therapists, track platform matrix analytics, oversight
              operations, and guide wellness journeys with confidence.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/95 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                <div className="w-2 h-2 rounded-full bg-teal-200 animate-pulse" />
                <span>Real-time Analytics & Governance</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/95 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                <div className="w-2 h-2 rounded-full bg-teal-200" />
                <span>Therapist & User Portal Control</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-teal-100/80">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-200" />
              <span>Encrypted & Secured</span>
            </div>
            <span>v1.0 Admin</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="max-w-md w-full mx-auto">
            {/* Header / Logo Mobile display */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="p-2 bg-[#00ACA7]/10 rounded-xl">
                <Image
                  src="/brand.svg"
                  width={32}
                  height={24}
                  alt="MindShift Logo"
                />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">
                MindShift
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sign in
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Welcome back! Please enter your details to access your account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@mindshift.com"
                    required
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#00ACA7] focus:ring-2 focus:ring-[#00ACA7]/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input with Toggle Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#00ACA7] hover:text-[#009691] transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••••"
                    required
                    className="w-full h-12 pl-12 pr-12 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#00ACA7] focus:ring-2 focus:ring-[#00ACA7]/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#00ACA7] focus:ring-[#00ACA7]/30 cursor-pointer accent-[#00ACA7]"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember me on this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 bg-[#00ACA7] hover:bg-[#009691] text-white font-medium text-sm rounded transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Protected by MindShift Security Protocol • All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
