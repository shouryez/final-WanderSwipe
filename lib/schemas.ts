import { z } from "zod"

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
  photos: z.array(z.string()),
  source: z.string().optional(),
  raw: z.any().optional(),
  distanceMeters: z.number().nullable().optional(),
  shortDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  wikidataId: z.string().optional(),
})

export const PlacesResponseSchema = z.object({
  ok: z.boolean().optional(),
  places: z.array(PlaceSchema),
})

export const ItineraryDayBlockSchema = z.object({
  time: z.string(),
  placeId: z.string().optional(),
  notes: z.string(),
})

export const ItineraryDaySchema = z.object({
  date: z.string(),
  blocks: z.array(ItineraryDayBlockSchema),
})

export const ItineraryResponseSchema = z.object({
  itineraryId: z.string().optional(),
  summary: z.string().optional(),
  days: z.array(ItineraryDaySchema).optional(),
  estimatedCost: z.number().optional(),
  itinerary: z.string().optional(), // For text-based itineraries
})

export const GenerateItineraryRequestSchema = z.object({
  places: z.array(z.string()).optional(),
  place: z.any().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.number().optional(),
  budget: z.string().optional(),
  pace: z.string().optional(),
  preferences: z
    .object({
      budget: z.enum(["low", "mid", "high"]).optional(),
      interests: z.array(z.string()).optional(),
      mobileFriendly: z.boolean().optional(),
    })
    .optional(),
  prefs: z.any().optional(),
})

export type Place = z.infer<typeof PlaceSchema>
export type PlacesResponse = z.infer<typeof PlacesResponseSchema>
export type ItineraryResponse = z.infer<typeof ItineraryResponseSchema>
export type GenerateItineraryRequest = z.infer<typeof GenerateItineraryRequestSchema>
