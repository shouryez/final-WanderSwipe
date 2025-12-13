"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Map, Calendar, Compass, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAppStore } from "@/lib/store"

export default function MyItinerariesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const { lastItinerary } = useAppStore()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        router.push("/auth/login?redirect=/my-itineraries")
        return
      }

      setUser(data.user)
      setLoading(false)
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const hasItinerary = lastItinerary !== null

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">My Itineraries</h1>
          </div>
          <p className="text-muted-foreground">Your saved trip plans and AI-generated itineraries</p>
        </motion.div>

        {/* Content */}
        {hasItinerary ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Last Itinerary Card */}
            <Link href="/itinerary">
              <div className="group rounded-2xl border border-border bg-card p-6 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {lastItinerary.place.name} Trip
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lastItinerary.days} days · {lastItinerary.budget} budget · {lastItinerary.pace} pace
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Generated {new Date(lastItinerary.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Map className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">No itineraries yet</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Generate your first trip plan from any destination page to see it here.
            </p>
            <Link href="/explore">
              <Button className="mt-6 gap-2">
                <Compass className="h-4 w-4" />
                Explore Destinations
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
