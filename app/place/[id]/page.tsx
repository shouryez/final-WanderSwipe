"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Wallet,
  Bookmark,
  Share2,
  Sparkles,
  MessageCircle,
  Send,
  X,
  Languages,
  UtensilsCrossed,
  Landmark,
  Cloud,
  MapPinned,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type PlaceDetail = {
  id: string
  name: string
  description: string
  photos: string[]
  tags: string[]
  lat: number
  lon: number
  avgCostDay: number
  bestTimeToVisit: string
  languagesSpoken: string[]
  famousPlaces: string[]
  famousFood: string[]
  recommendedStay: string
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function PlaceDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = (params?.id as string) || ""
  const { toast } = useToast()

  const [place, setPlace] = useState<PlaceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const { savedPlaces, addSavedPlace, removeSavedPlace } = useAppStore()
  const isSaved = savedPlaces.includes(id)

  useEffect(() => {
    loadPlace()
  }, [id])

  async function loadPlace() {
    setLoading(true)

    try {
      // Fetch from wikidata-places API
      const response = await fetch("/api/wikidata-places")
      const data = await response.json()

      const foundPlace = data.places?.find((p: any) => p.id === id)

      if (foundPlace) {
        // Enrich with detailed information
        setPlace({
          ...foundPlace,
          avgCostDay: Math.floor(Math.random() * 3000) + 2000, // 2000-5000
          bestTimeToVisit: getBestTimeToVisit(foundPlace.name),
          languagesSpoken: getLanguages(foundPlace.name),
          famousPlaces: getFamousPlaces(foundPlace.name),
          famousFood: getFamousFood(foundPlace.name),
          recommendedStay: "2-4 days",
        })
      }
    } catch (error) {
      console.error("Failed to load place:", error)
      toast({
        title: "Error",
        description: "Failed to load place details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper functions to provide detailed information
  function getBestTimeToVisit(placeName: string): string {
    const winterPlaces = ["Goa", "Kerala", "Mumbai", "Chennai", "Bangalore", "Pondicherry"]
    const summerPlaces = ["Manali", "Shimla", "Darjeeling", "Ooty", "Ladakh", "Nainital"]
    const yearRound = ["Delhi", "Jaipur", "Agra", "Kolkata", "Hyderabad"]

    if (winterPlaces.some((p) => placeName.includes(p))) return "November to February"
    if (summerPlaces.some((p) => placeName.includes(p))) return "March to June"
    return "October to March"
  }

  function getLanguages(placeName: string): string[] {
    const languageMap: { [key: string]: string[] } = {
      Kerala: ["Malayalam", "English", "Tamil"],
      Goa: ["Konkani", "Marathi", "English", "Hindi"],
      Mumbai: ["Marathi", "Hindi", "English"],
      Delhi: ["Hindi", "English", "Punjabi"],
      Bangalore: ["Kannada", "English", "Hindi", "Tamil"],
      Chennai: ["Tamil", "English", "Hindi"],
      Kolkata: ["Bengali", "Hindi", "English"],
      Jaipur: ["Hindi", "English", "Rajasthani"],
    }

    for (const [key, langs] of Object.entries(languageMap)) {
      if (placeName.includes(key)) return langs
    }
    return ["Hindi", "English"]
  }

  function getFamousPlaces(placeName: string): string[] {
    const placesMap: { [key: string]: string[] } = {
      Goa: ["Baga Beach", "Basilica of Bom Jesus", "Dudhsagar Falls", "Fort Aguada", "Anjuna Flea Market"],
      Mumbai: ["Gateway of India", "Marine Drive", "Colaba", "Elephanta Caves", "Juhu Beach"],
      Delhi: ["Red Fort", "Qutub Minar", "India Gate", "Lotus Temple", "Humayun's Tomb"],
      Jaipur: ["Hawa Mahal", "Amber Fort", "City Palace", "Jantar Mantar", "Jal Mahal"],
      Agra: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh", "Itmad-ud-Daulah"],
      Kerala: ["Alleppey Backwaters", "Munnar Tea Gardens", "Kovalam Beach", "Periyar Wildlife Sanctuary"],
    }

    for (const [key, places] of Object.entries(placesMap)) {
      if (placeName.includes(key)) return places
    }
    return ["Local Markets", "Historical Monuments", "Scenic Viewpoints", "Cultural Centers"]
  }

  function getFamousFood(placeName: string): string[] {
    const foodMap: { [key: string]: string[] } = {
      Goa: ["Fish Curry Rice", "Bebinca", "Xacuti", "Sorpotel", "Feni"],
      Mumbai: ["Vada Pav", "Pav Bhaji", "Bhel Puri", "Bombay Sandwich", "Misal Pav"],
      Delhi: ["Chole Bhature", "Butter Chicken", "Paranthas", "Kebabs", "Chaat"],
      Jaipur: ["Dal Baati Churma", "Laal Maas", "Ghewar", "Pyaaz Kachori", "Mawa Kachori"],
      Kerala: ["Appam with Stew", "Fish Moilee", "Puttu", "Banana Chips", "Sadya"],
      Hyderabad: ["Biryani", "Haleem", "Double Ka Meetha", "Mirchi Ka Salan"],
    }

    for (const [key, foods] of Object.entries(foodMap)) {
      if (placeName.includes(key)) return foods
    }
    return ["Local Cuisine", "Street Food", "Regional Specialties", "Traditional Dishes"]
  }

  const handleSave = async () => {
    if (isSaved) {
      removeSavedPlace(id)
      toast({
        title: "Removed from WanderList",
        description: `${place?.name} has been removed.`,
      })
    } else {
      addSavedPlace(id)

      // Sync to Supabase if logged in
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user && place) {
        await supabase.from("wanderlist_items").insert({
          user_id: data.user.id,
          place_id: id,
          place_name: place.name,
          place_lat: place.lat,
          place_lon: place.lon,
          place_description: place.description,
          place_photos: place.photos,
        })
      }

      toast({
        title: "Saved to WanderList!",
        description: `${place?.name} has been added.`,
      })
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: `${place?.name} - WanderSwipe`,
      text: `Check out ${place?.name} on WanderSwipe!`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied!",
          description: "The page link has been copied to your clipboard.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share the page",
        variant: "destructive",
      })
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !place) return

    const userMessage: ChatMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setChatLoading(true)

    try {
      const response = await fetch("/api/place-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeName: place.name,
          question: chatInput,
          history: chatMessages,
        }),
      })

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer || "Sorry, I couldn't generate a response.",
      }
      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      })
    } finally {
      setChatLoading(false)
    }
  }

  const nextPhoto = () => {
    if (!place) return
    setPhotoIndex((prev) => (prev + 1) % place.photos.length)
  }

  const prevPhoto = () => {
    if (!place) return
    setPhotoIndex((prev) => (prev - 1 + place.photos.length) % place.photos.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-lg text-muted-foreground">Place not found</p>
        <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      {/* Hero Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-muted">
        <Image
          src={place.photos[photoIndex] || "/placeholder.svg"}
          alt={place.name}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Navigation */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full glass backdrop-blur-md hover:bg-white/30 transition-colors z-10"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>

        {/* Photo Navigation */}
        {place.photos.length > 1 && (
          <>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {place.photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPhotoIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === photoIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full glass backdrop-blur-md hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full glass backdrop-blur-md hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Place Name Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
          >
            {place.name}
          </motion.h1>
          <p className="text-white/90 text-lg mt-2 drop-shadow-md">{place.description}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} variant={isSaved ? "default" : "outline"} className="gap-2">
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save to WanderList"}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="gap-2 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Link href={`/itinerary/generate?placeId=${id}`}>
                <Button className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                  <Sparkles className="h-4 w-4" />
                  Plan Trip
                </Button>
              </Link>
            </div>

            {/* Tags */}
            {place.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full glass text-sm font-medium border border-teal-200 dark:border-teal-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl glass border border-border/50 p-5">
                <div className="flex items-center gap-2 text-teal-600 mb-2">
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs font-medium text-muted-foreground">Avg Cost/Day</span>
                </div>
                <p className="text-2xl font-bold">₹{place.avgCostDay.toLocaleString()}</p>
              </div>

              <div className="rounded-xl glass border border-border/50 p-5">
                <div className="flex items-center gap-2 text-cyan-600 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs font-medium text-muted-foreground">Best Stay</span>
                </div>
                <p className="text-2xl font-bold">{place.recommendedStay}</p>
              </div>

              <div className="rounded-xl glass border border-border/50 p-5">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Cloud className="h-5 w-5" />
                  <span className="text-xs font-medium text-muted-foreground">Best Time</span>
                </div>
                <p className="text-sm font-semibold leading-tight">{place.bestTimeToVisit}</p>
              </div>
            </div>

            {/* Languages Spoken */}
            <div className="rounded-2xl glass border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                  <Languages className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Languages Spoken</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {place.languagesSpoken.map((lang) => (
                  <span
                    key={lang}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 text-sm font-medium text-teal-900 dark:text-teal-100 border border-teal-200 dark:border-teal-800"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Famous Places to Visit */}
            <div className="rounded-2xl glass border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                  <Landmark className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold">Must-Visit Places</h2>
              </div>
              <ul className="space-y-3">
                {place.famousPlaces.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Famous Food */}
            <div className="rounded-2xl glass border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                  <UtensilsCrossed className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold">Must-Try Food</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {place.famousFood.map((food, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800"
                  >
                    <UtensilsCrossed className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-900 dark:text-amber-100">{food}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Cost of Travel */}
            <div className="rounded-2xl glass border border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                  <DollarSign className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold">Average Cost of Travel</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Accommodation</h4>
                  <p className="text-muted-foreground">₹{(place.avgCostDay * 0.5).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Food</h4>
                  <p className="text-muted-foreground">₹{(place.avgCostDay * 0.3).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Transport</h4>
                  <p className="text-muted-foreground">₹{(place.avgCostDay * 0.2).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Activities</h4>
                  <p className="text-muted-foreground">₹{(place.avgCostDay * 0.3).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 rounded-2xl glass border border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">AI Travel Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask anything about {place.name}</p>
                </div>
              </div>

              <Button
                onClick={() => setShowChatbot(true)}
                className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with AI
              </Button>

              <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
                Get instant answers about attractions, food, culture, safety, and travel tips
              </p>
            </motion.div>

            {/* Location Card */}
            <div className="rounded-2xl glass border border-border/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinned className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold">Location</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Coordinates: {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-600 hover:underline flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot Modal */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full md:max-w-2xl h-[85vh] md:h-[700px] rounded-t-3xl md:rounded-3xl glass border border-border/50 bg-card flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Travel Assistant</h3>
                    <p className="text-xs text-muted-foreground">{place.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowChatbot(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-teal-600" />
                    </div>
                    <p className="text-muted-foreground mb-4">Ask me anything about {place.name}!</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["Best time to visit?", "What food to try?", "Budget tips?", "Safety concerns?"].map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setChatInput(suggestion)}
                            className="px-4 py-2 rounded-lg glass text-sm hover:bg-teal-50 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-800 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                          : "glass border border-border/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {chatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="glass border border-border/50 rounded-2xl px-4 py-3">
                      <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
                        <div
                          className="h-2 w-2 rounded-full bg-teal-500 animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-teal-500 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="p-6 border-t border-border/50 bg-card">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about attractions, food, safety..."
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    disabled={chatLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
