"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Bug, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APIError } from "@/lib/api-client"

interface APIErrorBannerProps {
  error: APIError
  onRetry?: () => void
  onDismiss?: () => void
}

export function APIErrorBanner({ error, onRetry, onDismiss }: APIErrorBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-destructive">API Error</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{error.message}</p>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Endpoint:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{error.endpoint}</code>
            </div>

            {error.expectedKeys.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Expected keys:</span>{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{error.expectedKeys.join(", ")}</code>
              </div>
            )}

            {error.actualResponse && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View response</summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-muted p-2 font-mono text-[10px]">
                  {JSON.stringify(error.actualResponse, null, 2)}
                </pre>
              </details>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 bg-transparent">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => {
                console.group("API Error Details")
                console.log("Endpoint:", error.endpoint)
                console.log("Message:", error.message)
                console.log("Expected Keys:", error.expectedKeys)
                console.log("Actual Response:", error.actualResponse)
                console.groupEnd()
              }}
            >
              <Bug className="h-3.5 w-3.5" />
              Log to Console
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
