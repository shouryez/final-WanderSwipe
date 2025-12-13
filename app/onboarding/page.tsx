"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Map,
  Compass,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Mountain,
  Palmtree,
  Building,
  Moon,
  Camera,
  TreePine,
  Car,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"

const interests = [
  { id: "mountains", label: "Mountains", icon: Mountain },
  { id: "beaches", label: "Beaches", icon: Palmtree },
  { id: "history", label: "History & Culture", icon: Building },
  { id: "nightlife", label: "Nightlife", icon: Moon },
  { id: "wildlife", label: "Wildlife", icon: TreePine },
  { id: "city", label: "City Breaks", icon: Building },
  { id: "roadtrips", label: "Roadtrips", icon: Car },
  { id: "offbeat", label: "Offbeat", icon: Camera },
]

const distances = ["100km", "200km", "500km", "750km", "2000km", "Any"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  const { preferences, setPreferences } = useAppStore()

  const [form, setForm] = useState({
    startDate: preferences?.startDate || "",
    endDate: preferences?.endDate || "",
    flexible: preferences?.flexible || false,
    distance: preferences?.distance || "",
    interests: preferences?.interests || [],
    location: preferences?.location || "",
    lat: preferences?.lat,
    lon: preferences?.lon,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  const updateForm = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const toggleInterest = (interest: string) => {
    if (form.interests.includes(interest)) {
      updateForm({ interests: form.interests.filter((i) => i !== interest) })
    } else {
      updateForm({ interests: [...form.interests, interest] })
    }
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateForm({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          location: form.location || "Current location",
        })
      },
      () => {
        alert("Could not get your location")
      },
    )
  }

  const handleFinish = async () => {
    setPreferences(form)

    // Sync to Supabase if logged in
    if (userId) {
      const supabase = createClient()
      const maxDistance =
        form.distance === "Any" || !form.distance ? null : Number.parseInt(form.distance.replace("km", ""))

      await supabase.from("user_preferences").upsert({
        user_id: userId,
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        flexible: form.flexible,
        max_distance_km: maxDistance,
        interests: form.interests,
        location: form.location || null,
        lat: form.lat ?? null,
        lon: form.lon ?? null,
        updated_at: new Date().toISOString(),
      })
    }

    router.push("/explore")
  }

  const steps = [
    { label: "Dates", icon: Calendar },
    { label: "Distance", icon: Map },
    { label: "Interests", icon: Compass },
    { label: "Location", icon: MapPin },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            Trip Planner
          </div>
          <h1 className="text-3xl font-bold">Plan Your Adventure</h1>
          <p className="mt-2 text-muted-foreground">Answer a few questions to personalize your experience</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, idx) => {
            const StepIcon = s.icon
            const isActive = step === idx + 1
            const isDone = step > idx + 1

            return (
              <div key={s.label} className="flex items-center">
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </motion.div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${step > idx + 1 ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-xl"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Dates */}
            {step === 1 && (
              <motion.div
                key="dates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold">When do you want to travel?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select your travel dates or mark as flexible</p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.flexible}
                    onChange={(e) =>
                      updateForm({
                        flexible: e.target.checked,
                        startDate: "",
                        endDate: "",
                      })
                    }
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Dates not decided yet</span>
                </label>

                {!form.flexible && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">From</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => updateForm({ startDate: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">To</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => updateForm({ endDate: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={() => setStep(2)}>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Distance */}
            {step === 2 && (
              <motion.div
                key="distance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold">How far are you willing to travel?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select your preferred travel distance</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {distances.map((d) => (
                    <button
                      key={d}
                      onClick={() => updateForm({ distance: d })}
                      className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                        form.distance === d
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold">What kind of places do you like?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select multiple to help us suggest the right vibe
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {interests.map((interest) => {
                    const Icon = interest.icon
                    const selected = form.interests.includes(interest.id)

                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          selected ? "border-primary bg-primary/10" : "border-border bg-secondary/50 hover:bg-secondary"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            selected ? "bg-primary text-primary-foreground" : "bg-background"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium ${selected ? "text-primary" : ""}`}>
                          {interest.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(2)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(4)}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Location */}
            {step === 4 && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold">Where are you starting from?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">This helps us show distances to destinations</p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateForm({ location: e.target.value })}
                    placeholder="Enter your city (e.g., Bengaluru)"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                  />

                  <button onClick={handleUseLocation} className="text-sm text-primary hover:underline">
                    Use my current location
                  </button>

                  {form.lat && form.lon && (
                    <p className="text-xs text-muted-foreground">
                      Location captured ({form.lat.toFixed(2)}, {form.lon.toFixed(2)})
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(3)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleFinish}>
                    Start Exploring
                    <Compass className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
