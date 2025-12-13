"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Compass, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        {/* 404 Graphic */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="text-[150px] font-bold text-muted/20 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Compass className="h-10 w-10 text-primary" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you've wandered off the map. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
