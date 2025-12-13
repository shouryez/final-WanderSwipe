import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data: posts, error } = await supabase
      .from("community_posts")
      .select(
        `
        *,
        community_likes(user_id)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get current user to check if they liked each post
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const postsWithLikes = posts.map((post) => ({
      ...post,
      liked_by_user: user ? post.community_likes.some((like: any) => like.user_id === user.id) : false,
    }))

    return NextResponse.json({ posts: postsWithLikes, success: true })
  } catch (error: any) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { place_name, place_lat, place_lon, place_id, image_url, caption } = body

    if (!place_name || !image_url || !caption) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user profile for name
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

    const { data: post, error } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_name: profile?.full_name || user.email?.split("@")[0] || "Anonymous",
        place_id,
        place_name,
        place_lat,
        place_lon,
        image_url,
        caption,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post, success: true })
  } catch (error: any) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 })
  }
}
