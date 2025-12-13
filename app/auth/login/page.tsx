"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // OTP state
  const [otpEmail, setOtpEmail] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")

  // Password state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)
    setOtpError("")

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/explore`,
        },
      })

      if (error) throw error

      router.push(`/auth/verify-otp?email=${encodeURIComponent(otpEmail)}`)
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/explore")
    } catch (err: any) {
      setPasswordError(err.message || "Invalid email or password")
    } finally {
      setPasswordLoading(false)
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
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader className="space-y-2 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-300">
              Sign in to continue your travel journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="otp" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="otp">Email OTP</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="otp">
                <form onSubmit={handleOTPLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="you@example.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                        disabled={otpLoading}
                        className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400"
                    >
                      {otpError}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg"
                  >
                    {otpLoading ? "Sending..." : "Send OTP Code"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={passwordLoading}
                        className="pl-10 h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={passwordLoading}
                        className="pl-10 pr-10 h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400"
                    >
                      {passwordError}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg"
                  >
                    {passwordLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400"
        >
          Discover amazing destinations across India with personalized itineraries
        </motion.p>
      </motion.div>
    </div>
  )
}
