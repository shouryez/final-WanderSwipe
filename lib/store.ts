"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Place } from "./schemas"

interface AppState {
  // User preferences
  preferences: {
    startDate: string
    endDate: string
    flexible: boolean
    distance: string
    interests: string[]
    location: string
    lat?: number
    lon?: number
  } | null
  setPreferences: (prefs: AppState["preferences"]) => void

  // Saved places (wanderlist)
  savedPlaces: string[]
  addSavedPlace: (placeId: string) => void
  removeSavedPlace: (placeId: string) => void

  // Current swipe session
  swipedPlaces: { placeId: string; liked: boolean }[]
  addSwipe: (placeId: string, liked: boolean) => void
  clearSwipes: () => void

  // Settings
  settings: {
    apiBaseUrl: string
    debugMode: boolean
    schemaValidation: boolean
    radius?: number // Added radius to settings for distance filtering
  }
  updateSettings: (settings: Partial<AppState["settings"]>) => void

  // Last itinerary
  lastItinerary: {
    place: Place
    days: number
    budget: string
    pace: string
    text: string
    generatedAt: string
  } | null
  setLastItinerary: (itinerary: AppState["lastItinerary"]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: null,
      setPreferences: (prefs) => set({ preferences: prefs }),

      savedPlaces: [],
      addSavedPlace: (placeId) =>
        set((state) => ({
          savedPlaces: state.savedPlaces.includes(placeId) ? state.savedPlaces : [...state.savedPlaces, placeId],
        })),
      removeSavedPlace: (placeId) =>
        set((state) => ({
          savedPlaces: state.savedPlaces.filter((id) => id !== placeId),
        })),

      swipedPlaces: [],
      addSwipe: (placeId, liked) =>
        set((state) => ({
          swipedPlaces: [...state.swipedPlaces, { placeId, liked }],
        })),
      clearSwipes: () => set({ swipedPlaces: [] }),

      settings: {
        apiBaseUrl: "",
        debugMode: false,
        schemaValidation: true,
        radius: 2000, // default 2000km
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      lastItinerary: null,
      setLastItinerary: (itinerary) => set({ lastItinerary: itinerary }),
    }),
    {
      name: "wanderswipe-storage",
    },
  ),
)
