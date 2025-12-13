-- Create community_posts table for user-generated content
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  place_id TEXT,
  place_name TEXT NOT NULL,
  place_lat DECIMAL(10, 8),
  place_lon DECIMAL(11, 8),
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_likes table for tracking post likes
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_place ON community_posts(place_name);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts (public read, authenticated write)
CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for community_likes
CREATE POLICY "Anyone can view likes"
  ON community_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on community_posts
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update likes_count when a like is added/removed
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update likes_count
CREATE TRIGGER update_likes_count_on_insert
  AFTER INSERT ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER update_likes_count_on_delete
  AFTER DELETE ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
