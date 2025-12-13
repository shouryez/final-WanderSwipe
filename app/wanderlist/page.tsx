"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, Compass, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceCard } from "@/components/place-card"
import { SkeletonList } from "@/components/skeleton-card"
import { createClient } from "@/lib/supabase/client"
import { useAppStore } from "@/lib/store"

type WanderPlace = {
  id: string
  name: string
  lat: number | null
  lon: number | null
  photos: string[]
  tags?: string[]
  description?: string
}

export default function WanderListPage() {
  const [places, setPlaces] = useState<WanderPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const { savedPlaces, removeSavedPlace } = useAppStore()

  useEffect(() => {
    loadWanderlist()
  }, [])

  async function loadWanderlist() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()

    console.log("[v0] Loading wanderlist, user:", data?.user?.id)

    if (data.user) {
      setUserId(data.user.id)

      const { data: items, error } = await supabase
        .from("wanderlist_items")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Loaded wanderlist items from database:", items, error)

      if (!error && items && items.length > 0) {
        const wanderPlaces: WanderPlace[] = items.map((item) => ({
          id: item.place_id,
          name: item.place_name,
          lat: item.place_lat ? Number(item.place_lat) : null,
          lon: item.place_lon ? Number(item.place_lon) : null,
          description: item.place_description,
          photos: Array.isArray(item.place_photos) ? item.place_photos : [],
          tags: [],
        }))

        setPlaces(wanderPlaces)
      } else {
        setPlaces([])
      }
    } else {
      setUserId(null)
      console.log("[v0] No user logged in, wanderlist is empty")
      setPlaces([])
    }

    setLoading(false)
  }

  const handleRemove = async (placeId: string) => {
    console.log("[v0] Removing place from wanderlist:", placeId)
    removeSavedPlace(placeId)
    setPlaces((prev) => prev.filter((p) => p.id !== placeId))

    if (userId) {
      const supabase = createClient()
      const { error } = await supabase.from("wanderlist_items").delete().match({ user_id: userId, place_id: placeId })

      if (error) {
        console.error("[v0] Failed to remove from database:", error)
      } else {
        console.log("[v0] Successfully removed from database")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your WanderList</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Loading your saved destinations...</p>
          </div>
          <SkeletonList count={4} />
        </div>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg mb-6"
          >
            <Heart className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your WanderList is empty</h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-md">
            Start exploring and swipe right on destinations you love to add them here.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap justify-center">
            <Link href="/explore">
              <Button className="gap-2 h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                <Compass className="h-5 w-5" />
                Explore Destinations
              </Button>
            </Link>
            {!userId && (
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="h-12 px-6 glass border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950 bg-transparent transition-all duration-300"
                >
                  Sign in to sync
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-6 flex-wrap"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg">
                  <Heart className="h-7 w-7 text-white fill-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white md:text-5xl">Your WanderList</h1>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {places.length} saved destination{places.length !== 1 ? "s" : ""} waiting for you to explore
              </p>
            </div>
            <Link href="/explore">
              <Button className="gap-2 h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                <Sparkles className="h-5 w-5" />
                Discover More
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className="rounded-2xl overflow-hidden glass border border-border/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <PlaceCard
                  place={{
                    id: place.id,
                    name: place.name,
                    photos: place.photos,
                    tags: place.tags || [],
                    lat: place.lat,
                    lon: place.lon,
                  }}
                  isSaved
                  showActions={false}
                />
              </div>

              {/* Remove Button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 h-10 w-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl"
                onClick={() => handleRemove(place.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
