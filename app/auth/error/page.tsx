"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { XCircle, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    access_denied: "Access was denied. Please try again.",
    invalid_request: "Invalid request. Please try again.",
    default: "An authentication error occurred.",
  }

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">WanderSwipe</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-6">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="mt-3 text-muted-foreground">{message}</p>
          {error && (
            <p className="mt-2 text-xs text-muted-foreground font-mono bg-muted rounded px-2 py-1 inline-block">
              Error code: {error}
            </p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/auth/login">
              <Button>Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="bg-transparent">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
