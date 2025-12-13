"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Wallet,
  Zap,
  Copy,
  Download,
  Share2,
  ChevronLeft,
  Sparkles,
  MapPin,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageWithBlur } from "@/components/image-with-blur"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function ItineraryPage() {
  const router = useRouter()
  const { lastItinerary } = useAppStore()
  const { toast } = useToast()

  if (!lastItinerary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">No itinerary found</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Generate a trip plan from any destination page to see it here.
        </p>
        <Link href="/explore">
          <Button className="mt-6">Explore Destinations</Button>
        </Link>
      </div>
    )
  }

  const { place, days, budget, pace, text, generatedAt } = lastItinerary
  const photo =
    place.photos?.[0] || `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(place.name + " travel")}`

  // Parse the itinerary text into sections
  const sections = parseItinerary(text)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Your itinerary has been copied.",
      })
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select and copy manually.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${place.name}-itinerary.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <ImageWithBlur src={photo || "/placeholder.svg"} alt={place.name} fill className="h-full w-full" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Header Content */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">AI Generated</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{place.name} Itinerary</h1>
            <p className="mt-1 text-muted-foreground text-sm">Generated {new Date(generatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Stats Bar */}
            <div className="flex flex-wrap gap-3">
              <StatBadge icon={Calendar} label={`${days} days`} />
              <StatBadge icon={Wallet} label={capitalize(budget)} />
              <StatBadge icon={Zap} label={`${capitalize(pace)} pace`} />
              <StatBadge icon={MapPin} label={place.name} />
            </div>

            {/* Itinerary Content */}
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  {section.type === "day" && (
                    <div className="bg-gradient-to-r from-primary/10 to-accent/5 px-5 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {section.dayNumber || idx + 1}
                        </div>
                        <h3 className="font-semibold">{section.title}</h3>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {section.items.length > 0 ? (
                      <ul className="space-y-3">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* Actions Card */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full gap-2 justify-start bg-transparent" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 justify-start bg-transparent"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    Download as Text
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start bg-transparent">
                    <Share2 className="h-4 w-4" />
                    Share Itinerary
                  </Button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="rounded-2xl border border-border bg-gradient-to-br from-info/5 to-primary/5 p-5">
                <h3 className="font-semibold mb-3">Travel Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Book accommodations near Day 1 activities
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Keep one buffer slot for unexpected plans
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Save this itinerary to your notes app
                  </li>
                </ul>
              </div>

              {/* Regenerate Card */}
              <Link href={`/place/${encodeURIComponent(place.id)}?generate=true`}>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 cursor-pointer hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Regenerate</h4>
                      <p className="text-xs text-muted-foreground">Create a new version</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function parseItinerary(text: string) {
  const lines = text.split("\n")
  const sections: {
    type: "day" | "tip" | "content"
    title: string
    dayNumber?: number
    items: string[]
    content: string
  }[] = []

  let currentSection: (typeof sections)[0] | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const dayMatch = trimmed.match(/^day\s*(\d+)/i)
    const tipMatch = /^tips?:?$/i.test(trimmed)

    if (dayMatch) {
      if (currentSection) sections.push(currentSection)
      currentSection = {
        type: "day",
        title: trimmed,
        dayNumber: Number.parseInt(dayMatch[1]),
        items: [],
        content: "",
      }
    } else if (tipMatch) {
      if (currentSection) sections.push(currentSection)
      currentSection = {
        type: "tip",
        title: "Tips",
        items: [],
        content: "",
      }
    } else if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      if (currentSection) {
        currentSection.items.push(trimmed.replace(/^[•\-*]\s*/, ""))
      }
    } else {
      if (currentSection) {
        if (currentSection.items.length === 0) {
          currentSection.content += (currentSection.content ? "\n" : "") + trimmed
        } else {
          currentSection.items.push(trimmed)
        }
      } else {
        sections.push({
          type: "content",
          title: "",
          items: [],
          content: trimmed,
        })
      }
    }
  }

  if (currentSection) sections.push(currentSection)

  return sections
}
