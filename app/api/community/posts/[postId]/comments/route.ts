import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type RouteContext = {
  params: Promise<{ postId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { postId } = await context.params
    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ comments, success: true })
  } catch (error: any) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { postId } = await context.params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { comment } = body

    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 })
    }

    // Get user profile for name
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

    const { data: newComment, error } = await supabase
      .from("community_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        user_email: user.email,
        user_name: profile?.full_name || user.email?.split("@")[0] || "Anonymous",
        comment,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ comment: newComment, success: true })
  } catch (error: any) {
    console.error("Error posting comment:", error)
    return NextResponse.json({ error: error.message || "Failed to post comment" }, { status: 500 })
  }
}
