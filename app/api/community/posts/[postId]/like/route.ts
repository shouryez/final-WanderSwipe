import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type RouteContext = {
  params: Promise<{ postId: string }>
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

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id)

      if (error) throw error

      return NextResponse.json({ liked: false, success: true })
    } else {
      // Like
      const { error } = await supabase.from("community_likes").insert({
        post_id: postId,
        user_id: user.id,
      })

      if (error) throw error

      return NextResponse.json({ liked: true, success: true })
    }
  } catch (error: any) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: error.message || "Failed to toggle like" }, { status: 500 })
  }
}
