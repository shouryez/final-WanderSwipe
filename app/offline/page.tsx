"use client"

import { motion } from "framer-motion"
import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10 mx-auto mb-8"
        >
          <WifiOff className="h-10 w-10 text-warning" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">You're Offline</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>

        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    </div>
  )
}
