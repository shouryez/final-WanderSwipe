"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Wallet,
  Sparkles,
  MapPin,
  Loader2,
  ChevronLeft,
  Download,
  Share2,
  MessageCircle,
  Send,
  X,
  Clock,
  Coffee,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ItineraryDay = {
  day: number
  morning: string
  afternoon: string
  evening: string
  tips?: string
}

type ItineraryData = {
  place: string
  days: ItineraryDay[]
  summary: string
  fullText: string
  numDays?: number
  budget?: string
  travelStyle?: string
  duration?: number
}

function GenerateItineraryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const placeId = searchParams.get("placeId") || ""
  const placeName = searchParams.get("placeName") || "Your Destination"

  const [generating, setGenerating] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)

  // Form state
  const [numDays, setNumDays] = useState(3)
  const [budgetPerDay, setBudgetPerDay] = useState(3000)
  const [budget, setBudget] = useState<"Low" | "Mid" | "High">("Mid")
  const [travelStyle, setTravelStyle] = useState<"Adventure" | "Relaxation" | "Heritage" | "Food" | "Shopping">(
    "Adventure",
  )
  const [companion, setCompanion] = useState<"Solo" | "Couple" | "Friends" | "Family">("Solo")
  const [travelMonth, setTravelMonth] = useState("")

  // Chat state
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeName,
          budget,
          numDays,
          travelStyle,
          companion,
          travelMonth: travelMonth || undefined,
          placeId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate itinerary")
      }

      setItinerary({
        ...data,
        numDays,
        budget,
        travelStyle,
      })

      toast({
        title: "Itinerary Generated!",
        description: "Your personalized travel plan is ready.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate itinerary",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !itinerary) return

    const userMessage: ChatMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setChatLoading(true)

    try {
      const response = await fetch("/api/itinerary-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary,
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

  const handleDownload = () => {
    if (!itinerary) return

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      // Header with gradient background effect
      doc.setFillColor(20, 184, 166) // Teal color
      doc.rect(0, 0, pageWidth, 40, "F")

      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text(placeName, pageWidth / 2, 25, { align: "center" })

      yPosition = 50

      // Trip Details Section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      if (itinerary.duration) {
        doc.setFont("helvetica", "bold")
        doc.text(`Duration: `, margin, yPosition)
        doc.setFont("helvetica", "normal")
        doc.text(`${itinerary.duration} days`, margin + 30, yPosition)
        yPosition += 10
      }

      if (itinerary.budget) {
        doc.setFont("helvetica", "bold")
        doc.text(`Budget: `, margin, yPosition)
        doc.setFont("helvetica", "normal")
        doc.text(`₹${itinerary.budget}`, margin + 30, yPosition)
        yPosition += 15
      }

      // Itinerary Details
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(20, 184, 166)
      doc.text("Day-by-Day Itinerary", margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")

      // Split the full text into lines
      const lines = doc.splitTextToSize(itinerary.fullText, pageWidth - 2 * margin)

      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 6
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(`Generated by WanderSwipe - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        })
      }

      doc.save(`${placeName.replace(/\s+/g, "-")}-itinerary.pdf`)

      toast({
        title: "Downloaded!",
        description: "Your itinerary PDF has been saved.",
      })
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      toast({
        title: "Download failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${placeName} Itinerary`,
          text: `Check out my travel itinerary for ${placeName}!`,
          url: url,
        })
        toast({
          title: "Shared!",
          description: "Itinerary shared successfully.",
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link Copied!",
          description: "Itinerary link copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("[v0] Share error:", error)
      toast({
        title: "Share failed",
        description: "Unable to share. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
        {/* Header */}
        <div className="border-b border-border/50 glass">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleDownload} className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={() => setShowChat(true)}
                  className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Title */}
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {placeName} Adventure
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {itinerary.summary}
              </p>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl glass border border-border/50 p-5 text-center">
                <Calendar className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{itinerary.days.length}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="rounded-xl glass border border-border/50 p-5 text-center">
                <Wallet className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{budget}</p>
                <p className="text-xs text-muted-foreground">Budget</p>
              </div>
              <div className="rounded-xl glass border border-border/50 p-5 text-center">
                <Sparkles className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{travelStyle}</p>
                <p className="text-xs text-muted-foreground">Style</p>
              </div>
              <div className="rounded-xl glass border border-border/50 p-5 text-center">
                <MapPin className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{companion}</p>
                <p className="text-xs text-muted-foreground">Traveling</p>
              </div>
            </div>

            {/* Day by Day Itinerary */}
            <div className="space-y-6">
              {itinerary.days.map((day, idx) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl glass border border-border/50 p-6 md:p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold text-lg shadow-lg">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Day {day.day}</h3>
                      <p className="text-sm text-muted-foreground">Full day of exploration</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {day.morning && (
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                          <Sun className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-amber-600 mb-1">Morning</p>
                          <p className="text-foreground leading-relaxed">{day.morning}</p>
                        </div>
                      </div>
                    )}

                    {day.afternoon && (
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                          <Coffee className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-orange-600 mb-1">Afternoon</p>
                          <p className="text-foreground leading-relaxed">{day.afternoon}</p>
                        </div>
                      </div>
                    )}

                    {day.evening && (
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                          <Moon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-indigo-600 mb-1">Evening</p>
                          <p className="text-foreground leading-relaxed">{day.evening}</p>
                        </div>
                      </div>
                    )}

                    {day.tips && (
                      <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border border-teal-200 dark:border-teal-800">
                        <p className="text-sm">
                          <span className="font-semibold text-teal-800 dark:text-teal-300">💡 Local Tip:</span>{" "}
                          <span className="text-slate-800 dark:text-slate-200">{day.tips}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <Button
                onClick={() => setItinerary(null)}
                variant="outline"
                className="gap-2 glass border-teal-200 dark:border-teal-800 bg-transparent"
              >
                Generate Another Itinerary
              </Button>
            </div>
          </motion.div>
        </div>

        {/* AI Chat Modal */}
        <AnimatePresence>
          {showChat && (
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
                <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">Itinerary Assistant</h3>
                      <p className="text-xs text-muted-foreground">Ask about your trip</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-teal-600" />
                      </div>
                      <p className="text-muted-foreground mb-4">Ask me anything about your itinerary!</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "Can I modify Day 2?",
                          "Add food recommendations",
                          "Budget tips?",
                          "Alternative activities?",
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setChatInput(suggestion)}
                            className="px-4 py-2 rounded-lg glass text-sm hover:bg-teal-50 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-800 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
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

                <form onSubmit={handleChatSubmit} className="p-6 border-t border-border/50 bg-card">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your itinerary..."
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Plan Your Trip</h1>
          <p className="mt-3 text-lg text-muted-foreground">to {placeName}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl glass border border-border/50 bg-card p-8 shadow-xl space-y-6"
        >
          {/* Number of Days */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Calendar className="h-4 w-4 text-teal-600" />
              Number of Days
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={numDays}
              onChange={(e) => setNumDays(Number.parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          {/* Budget Per Day */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Wallet className="h-4 w-4 text-teal-600" />
              Budget Per Day
            </label>
            <input
              type="number"
              min={500}
              max={50000}
              step={500}
              value={budgetPerDay}
              onChange={(e) => setBudgetPerDay(Number.parseInt(e.target.value) || 1000)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            <p className="text-xs text-muted-foreground mt-2">₹{budgetPerDay.toLocaleString()} per day</p>
          </div>

          {/* Budget Level */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Wallet className="h-4 w-4 text-teal-600" />
              Budget Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Low", "Mid", "High"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBudget(opt)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    budget === opt
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Sparkles className="h-4 w-4 text-teal-600" />
              Travel Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["Adventure", "Relaxation", "Heritage", "Food", "Shopping"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTravelStyle(opt)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    travelStyle === opt
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Companion */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <MapPin className="h-4 w-4 text-teal-600" />
              Traveling With
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["Solo", "Couple", "Friends", "Family"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCompanion(opt)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    companion === opt
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Month */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Clock className="h-4 w-4 text-teal-600" />
              Travel Month (Optional)
            </label>
            <select
              value={travelMonth}
              onChange={(e) => setTravelMonth(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            >
              <option value="">Any month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-12 gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Your Itinerary...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate AI Itinerary
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default function GenerateItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      }
    >
      <GenerateItineraryContent />
    </Suspense>
  )
}
