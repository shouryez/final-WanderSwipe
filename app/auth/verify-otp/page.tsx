"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

function VerifyOTPContent() {
  const params = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const emailFromLink = params.get("email") || ""
  const [email, setEmail] = useState(emailFromLink)
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (emailFromLink) {
      setEmail(emailFromLink)
    }
  }, [emailFromLink])

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      })

      if (error) throw error

      // Success - redirect to explore
      router.push("/explore")
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setResendLoading(true)
    setError("")
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/explore`,
        },
      })

      if (error) throw error

      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Link
          href="/auth/otp"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader className="space-y-2 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-base text-slate-700 dark:text-slate-200">
              We&apos;ve sent an 8-digit code to <strong className="text-slate-900 dark:text-white">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 8-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  required
                  disabled={isLoading}
                  className="h-12 text-center text-2xl tracking-widest font-mono bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500 text-slate-900 dark:text-white"
                  maxLength={8}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-600 dark:text-green-400"
                >
                  OTP resent successfully! Check your email.
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 8}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendLoading}
                  className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              Check your spam folder if you don&apos;t see the email
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  )
}
