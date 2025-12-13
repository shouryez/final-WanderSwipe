"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, MapPin, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceCard } from "@/components/place-card"
import { TagChip } from "@/components/tag-chip"
import { SkeletonList } from "@/components/skeleton-card"
import { apiClient } from "@/lib/api-client"
import { PlacesResponseSchema, type Place } from "@/lib/schemas"
import { useAppStore } from "@/lib/store"

const allTags = [
  "Mountains",
  "Beaches",
  "History & Culture",
  "Nightlife",
  "Wildlife",
  "City breaks",
  "Roadtrips",
  "Offbeat",
]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState<number | null>(null)

  const { preferences, savedPlaces, addSavedPlace, removeSavedPlace } = useAppStore()

  useEffect(() => {
    loadPlaces()
  }, [])

  async function loadPlaces() {
    setLoading(true)
    const { data } = await apiClient("/api/wikidata-places", undefined, PlacesResponseSchema)

    if (data?.places) {
      // Calculate distances if user location is available
      const placesWithDistance = data.places.map((place) => {
        if (preferences?.lat && preferences.lon && place.lat && place.lon) {
          const distance = calculateDistance(preferences.lat, preferences.lon, place.lat, place.lon)
          return { ...place, distanceMeters: Math.round(distance * 1000) }
        }
        return place
      })
      setPlaces(placesWithDistance)
    }
    setLoading(false)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const clearFilters = () => {
    setSelectedTags([])
    setMaxDistance(null)
    setQuery("")
  }

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // Search query filter
      if (query) {
        const searchLower = query.toLowerCase()
        const nameMatch = place.name.toLowerCase().includes(searchLower)
        const tagMatch = place.tags?.some((t) => t.toLowerCase().includes(searchLower))
        if (!nameMatch && !tagMatch) return false
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = place.tags?.some((t) =>
          selectedTags.some((st) => t.toLowerCase().includes(st.toLowerCase())),
        )
        if (!hasMatchingTag) return false
      }

      // Distance filter
      if (maxDistance && place.distanceMeters) {
        if (place.distanceMeters / 1000 > maxDistance) return false
      }

      return true
    })
  }, [places, query, selectedTags, maxDistance])

  const handleSave = (placeId: string) => {
    if (savedPlaces.includes(placeId)) {
      removeSavedPlace(placeId)
    } else {
      addSavedPlace(placeId)
    }
  }

  const hasFilters = selectedTags.length > 0 || maxDistance !== null || query !== ""

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-bold">Search Destinations</h1>
            <p className="mt-2 text-muted-foreground">Find your perfect travel destination</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or tag..."
                className="w-full rounded-xl border border-input bg-background px-12 py-4 text-base focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className={`h-5 w-5 ${showFilters ? "text-primary" : ""}`} />
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-2xl mx-auto mt-6 overflow-hidden"
              >
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </h3>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <TagChip
                          key={tag}
                          label={tag}
                          selected={selectedTags.includes(tag)}
                          onClick={() => toggleTag(tag)}
                          variant="outline"
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Distance */}
                  {preferences?.lat && preferences.lon && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Max Distance</p>
                      <div className="flex flex-wrap gap-2">
                        {[100, 200, 500, 1000, null].map((d) => (
                          <button
                            key={d ?? "any"}
                            onClick={() => setMaxDistance(d)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                              maxDistance === d
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {d ? `${d} km` : "Any"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${filteredPlaces.length} destinations found`}
          </p>

          {hasFilters && (
            <div className="flex items-center gap-2">
              {selectedTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs">
                  {tag}
                  <button onClick={() => toggleTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {maxDistance && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {maxDistance} km
                  <button onClick={() => setMaxDistance(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonList count={6} />
        ) : filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            {hasFilters && (
              <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <PlaceCard place={place} onSave={() => handleSave(place.id)} isSaved={savedPlaces.includes(place.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
