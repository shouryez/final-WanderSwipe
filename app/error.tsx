"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-8"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred. Our team has been notified and we're working on a fix.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted rounded px-3 py-1.5 inline-block mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 bg-transparent w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
