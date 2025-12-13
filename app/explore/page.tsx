"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

import { CardStack } from "@/components/card-stack"
import { APIErrorBanner } from "@/components/api-error-banner"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

import { createClient } from "@/lib/supabase/client"
import type { APIError } from "@/lib/api-client"

import { useAppStore } from "@/lib/store"
import { SlidersHorizontal, MapPin, Compass, Sparkles, Heart, Navigation } from "lucide-react"

type Place = {
  id: string
  name: string
  lat: number
  lon: number
  photos: string[]
  popularity: number
  description: string
  wikipediaUrl?: string
  tags: string[]
  distanceMeters?: number
  shortDescription?: string
}

export default function ExplorePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<APIError | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)
  const [showDistanceFilter, setShowDistanceFilter] = useState(false) // toggle filter UI

  const { addSavedPlace, addSwipe, settings, updateSettings, preferences } = useAppStore()
  const { toast } = useToast()

  const currentRadius = preferences?.distance
    ? preferences.distance === "Any"
      ? 5000
      : Number.parseInt(preferences.distance.replace("km", ""))
    : settings.radius || 2000

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null)
    })

    if (preferences?.lat && preferences?.lon) {
      const loc = { lat: preferences.lat, lon: preferences.lon }
      setUserLocation(loc)
      loadPlaces(loc, currentRadius)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }
          setUserLocation(loc)
          loadPlaces(loc, currentRadius)
        },
        () => {
          loadPlaces(null, currentRadius)
        },
        { timeout: 6000 },
      )
    } else {
      loadPlaces(null, currentRadius)
    }
  }, [preferences, currentRadius])

  const loadPlaces = useCallback(
    async (location: { lat: number; lon: number } | null = userLocation, radius: number = currentRadius) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (location) {
          params.set("lat", location.lat.toString())
          params.set("lon", location.lon.toString())
          params.set("radius", radius.toString()) // Pass radius to API
        }

        const response = await fetch(`/api/wikidata-places?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load places")
        }

        if (data?.places) {
          const enrichedPlaces: Place[] = data.places.map((place: Place) => ({
            ...place,
            shortDescription: place.description,
          }))

          setPlaces(enrichedPlaces)
        }
      } catch (err: any) {
        setError({
          message: err.message || "Failed to load places",
          code: "FETCH_ERROR",
          statusCode: 500,
        })
      } finally {
        setLoading(false)
      }
    },
    [userLocation, currentRadius],
  )

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0]
    updateSettings({ radius: newRadius })
  }

  const applyRadiusFilter = () => {
    if (userLocation) {
      loadPlaces(userLocation, settings.radius || currentRadius)
    }
    setShowDistanceFilter(false)
    toast({
      title: "Filter Applied",
      description: `Showing places within ${settings.radius || currentRadius}km`,
      duration: 2000,
    })
  }

  const handleSwipe = useCallback(
    async (place: Place, direction: "left" | "right") => {
      const liked = direction === "right"
      addSwipe(place.id, liked)

      if (liked) {
        setShowHeartAnimation(true)
        setTimeout(() => setShowHeartAnimation(false), 1000)

        if (!userId) {
          console.log("[v0] User not authenticated, showing login modal")
          setLoginModalOpen(true)
          toast({
            title: "Sign in required",
            description: "Please sign in to save places to your WanderList",
            variant: "destructive",
          })
          return
        }

        console.log("[v0] Saving place to wanderlist:", place.id, place.name)
        addSavedPlace(place.id)

        try {
          const supabase = createClient()
          const { data: userData, error: userError } = await supabase.auth.getUser()

          if (userError || !userData.user) {
            console.error("[v0] Failed to get user:", userError)
            toast({
              title: "Authentication Error",
              description: "Please sign in again to save places",
              variant: "destructive",
            })
            setLoginModalOpen(true)
            return
          }

          console.log("[v0] Authenticated user ID:", userData.user.id)

          const { data, error } = await supabase
            .from("wanderlist_items")
            .insert({
              user_id: userData.user.id,
              place_id: place.id,
              place_name: place.name,
              place_lat: place.lat,
              place_lon: place.lon,
              place_description: place.description,
              place_photos: place.photos,
            })
            .select()

          if (error) {
            console.error("[v0] Failed to save to wanderlist:", error)
            // Check if it's a duplicate error
            if (error.code === "23505") {
              toast({
                title: "Already in WanderList",
                description: `${place.name} is already saved!`,
                duration: 2000,
              })
            } else {
              toast({
                title: "Save Failed",
                description: error.message || "Could not save to WanderList. Please try again.",
                variant: "destructive",
              })
            }
          } else {
            console.log("[v0] Successfully saved to wanderlist:", data)
            toast({
              title: "Saved to WanderList!",
              description: `${place.name} has been added to your collection.`,
              duration: 3000,
            })
          }
        } catch (err) {
          console.error("[v0] Exception saving to wanderlist:", err)
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          })
        }
      }
    },
    [userId, addSavedPlace, addSwipe, toast],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <Heart className="h-32 w-32 text-red-500 fill-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDistanceFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDistanceFilter(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl glass border border-border/50 bg-card p-8 shadow-2xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-4">
                <Navigation className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Distance Filter</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                Choose how far you want to explore from your location
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Distance Range</span>
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {settings.radius || currentRadius}km
                    </span>
                  </div>
                  <Slider
                    value={[settings.radius || currentRadius]}
                    onValueChange={handleRadiusChange}
                    min={50}
                    max={5000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span>50km</span>
                    <span>2500km</span>
                    <span>5000km</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDistanceFilter(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={applyRadiusFilter}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 blur-3xl" />
          <div className="absolute -right-4 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg mb-6"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Discover Your Next Adventure
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Swipe through India&apos;s most famous destinations. Save places you love and generate personalized
              itineraries instantly.
            </p>

            {userLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-3"
              >
                <div className="flex items-center gap-2 rounded-full glass px-5 py-3 text-sm shadow-lg">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {preferences?.location || `(${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)})`}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full glass px-5 py-3 text-sm shadow-lg">
                  <Navigation className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-medium text-slate-900 dark:text-white">Within {currentRadius}km</span>
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
              <Button
                onClick={() => setShowDistanceFilter(true)}
                variant="outline"
                className="gap-2 glass border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950 bg-transparent"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Distance Filter
              </Button>
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="gap-2 glass border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950 bg-transparent"
                >
                  <Compass className="h-4 w-4" />
                  Set Preferences
                </Button>
              </Link>
              <Link href="/wanderlist">
                <Button className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg">
                  <Heart className="h-4 w-4" />
                  My WanderList
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        {error ? (
          <div className="mx-auto max-w-lg">
            <APIErrorBanner error={error} onRetry={() => loadPlaces()} onDismiss={() => setError(null)} />
          </div>
        ) : (
          <CardStack
            places={places}
            loading={loading}
            onSwipe={handleSwipe}
            onRefresh={() => loadPlaces()}
            emptyMessage="You've explored all places in your range. Adjust your distance filter to see more!"
          />
        )}
      </section>

      {loginModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setLoginModalOpen(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl glass border border-border/50 bg-card p-8 shadow-2xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-4 mx-auto">
              <Compass className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Sign in to save places</h3>
            <p className="mt-3 text-center text-slate-600 dark:text-slate-300 leading-relaxed">
              Create an account to save destinations to your WanderList and generate personalized itineraries.
            </p>

            <div className="mt-6 flex gap-3">
              <Link href="/auth/otp" className="flex-1">
                <Button className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg">
                  Sign In
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setLoginModalOpen(false)} className="h-11">
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
