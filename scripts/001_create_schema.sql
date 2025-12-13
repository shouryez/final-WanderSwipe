-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (if not using Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  location JSONB, -- {lat: number, lon: number, city: string}
  radius_km INTEGER DEFAULT 500, -- search radius preference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create places table for caching
CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  description TEXT,
  photos JSONB, -- array of image URLs
  popularity INTEGER DEFAULT 0,
  tags JSONB, -- array of tags
  wikipedia_url TEXT,
  foursquare_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wanderlist_items table for saved places
CREATE TABLE IF NOT EXISTS wanderlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  place_lat DECIMAL(10, 8) NOT NULL,
  place_lon DECIMAL(11, 8) NOT NULL,
  place_description TEXT,
  place_photos JSONB,
  notes TEXT, -- user's personal notes
  visited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  budget TEXT CHECK (budget IN ('Low', 'Mid', 'High')),
  num_days INTEGER NOT NULL CHECK (num_days > 0 AND num_days <= 30),
  travel_style TEXT CHECK (travel_style IN ('Adventure', 'Relaxation', 'Heritage', 'Food', 'Shopping')),
  companion TEXT CHECK (companion IN ('Solo', 'Couple', 'Friends', 'Family')),
  travel_month TEXT,
  itinerary_data JSONB NOT NULL, -- full AI-generated itinerary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interests JSONB, -- array of interests
  budget_range TEXT,
  preferred_travel_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wanderlist_user_id ON wanderlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wanderlist_created_at ON wanderlist_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_places_popularity ON places(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wanderlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for wanderlist_items
CREATE POLICY "Users can view their own wanderlist"
  ON wanderlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wanderlist"
  ON wanderlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wanderlist items"
  ON wanderlist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wanderlist items"
  ON wanderlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for itineraries
CREATE POLICY "Users can view their own itineraries"
  ON itineraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own itineraries"
  ON itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON itineraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
  ON itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
