# Database Setup Guide

Your WanderSwipe app already has the right swipe save functionality implemented! However, you need to create the database tables first.

## Quick Setup

1. **Run the SQL Scripts**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the scripts in this order:
     - `scripts/001_create_schema.sql` (Creates main tables: profiles, places, wanderlist_items, itineraries, user_preferences)
     - `scripts/002_create_community_posts.sql` (Creates community_posts table)
     - `scripts/003_add_demo_community_posts.sql` (Adds demo posts to community)

2. **Verify Tables Were Created**
   - Go to Table Editor in Supabase
   - You should see: profiles, wanderlist_items, itineraries, user_preferences, community_posts

## How It Works

### Right Swipe Save Feature

When users swipe right on a place in the Explore page:

1. **Authenticated Users**: Place is saved to `wanderlist_items` table in Supabase
   - Includes: place_id, place_name, place_lat, place_lon, place_description, place_photos
   - Protected by Row Level Security (RLS) - users can only see their own saved places

2. **Guest Users**: Place is saved to local storage temporarily
   - Will sync to database when they sign in

### WanderList Page

The WanderList page (`/wanderlist`):
- Loads saved places from Supabase for authenticated users
- Falls back to local storage for guests
- Shows beautiful grid of saved destinations
- Allows removing places with trash icon on hover

## Testing

1. Sign in to your account at `/auth/login` or `/auth/otp`
2. Go to Explore page at `/explore`
3. Swipe right on places you like (or press right arrow key)
4. See heart animation confirming save
5. Visit WanderList at `/wanderlist` to see your saved places
6. Log out and log back in - your saved places persist!

## Database Tables

**wanderlist_items**
- `id`: UUID primary key
- `user_id`: UUID (references auth.users)
- `place_id`: Text (place identifier)
- `place_name`: Text
- `place_lat`: Float
- `place_lon`: Float
- `place_description`: Text
- `place_photos`: Text array
- `created_at`: Timestamp
- RLS enabled - users can only access their own items

All functionality is already implemented in the code - just run the SQL scripts!
