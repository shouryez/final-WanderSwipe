"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, MapPin, Plus, X, Upload, ImageIcon, Loader2, MessageCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"

type Comment = {
  id: string
  user_name: string
  comment: string
  created_at: string
}

type Post = {
  id: string
  user_name: string
  place_name: string
  place_lat?: number
  place_lon?: number
  image_url: string
  caption: string
  likes_count: number
  liked_by_user: boolean
  created_at: string
  comments?: Comment[]
  comments_count?: number
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState<string | null>(null)
  const [postingComment, setPostingComment] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [placeName, setPlaceName] = useState("")
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadPosts()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  async function loadPosts() {
    setLoading(true)
    try {
      const response = await fetch("/api/community/posts?limit=50")
      const data = await response.json()

      if (data.posts) {
        // Add comments_count to each post
        const postsWithCount = data.posts.map((post: Post) => ({
          ...post,
          comments_count: 0,
          comments: [],
        }))
        setPosts(postsWithCount)

        // Load comment counts for each post
        postsWithCount.forEach((post: Post) => {
          loadCommentsCount(post.id)
        })
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCommentsCount(postId: string) {
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`)
      const data = await response.json()

      if (data.comments) {
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, comments_count: data.comments.length } : post)),
        )
      }
    } catch (error) {
      console.error("Failed to load comments count:", error)
    }
  }

  async function loadComments(postId: string) {
    setLoadingComments(postId)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`)
      const data = await response.json()

      if (data.comments) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, comments: data.comments, comments_count: data.comments.length } : post,
          ),
        )
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    } finally {
      setLoadingComments(null)
    }
  }

  async function handleLike(postId: string) {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      })
      router.push("/auth/otp")
      return
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                liked_by_user: data.liked,
                likes_count: data.liked ? post.likes_count + 1 : post.likes_count - 1,
              }
            }
            return post
          }),
        )
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      })
    }
  }

  async function handlePostComment(postId: string) {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      router.push("/auth/otp")
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something",
        variant: "destructive",
      })
      return
    }

    setPostingComment(postId)
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
      })

      const data = await response.json()

      if (data.success) {
        setNewComment("")
        // Reload comments for this post
        await loadComments(postId)
        toast({
          title: "Comment posted!",
          description: "Your comment has been added",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setPostingComment(null)
    }
  }

  function toggleComments(postId: string) {
    if (expandedComments === postId) {
      setExpandedComments(null)
    } else {
      setExpandedComments(postId)
      const post = posts.find((p) => p.id === postId)
      if (!post?.comments || post.comments.length === 0) {
        loadComments(postId)
      }
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create posts",
        variant: "destructive",
      })
      router.push("/auth/otp")
      return
    }

    if (!imageFile || !placeName || !caption) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select an image",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("community-images")
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error("Failed to upload image. Please ensure storage is configured.")
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("community-images").getPublicUrl(fileName)

      // Create post
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_name: placeName,
          image_url: publicUrl,
          caption,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Post created!",
          description: "Your travel experience has been shared with the community",
        })
        setShowCreateModal(false)
        setPlaceName("")
        setCaption("")
        setImageFile(null)
        setImagePreview(null)
        loadPosts()
      } else {
        throw new Error(data.error || "Failed to create post")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white md:text-5xl">Travel Community</h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
                Share your adventures and explore where others have been
              </p>
            </div>

            {user && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-12 px-6 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Share Your Experience
              </Button>
            )}

            {!user && (
              <Button
                onClick={() => router.push("/auth/otp")}
                variant="outline"
                className="gap-2 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950"
              >
                Sign In to Post
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group rounded-2xl overflow-hidden glass border border-border/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={post.image_url || "/placeholder.svg"}
                    alt={post.place_name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* </CHANGE> */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Like button */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full glass backdrop-blur-md hover:scale-110 transition-transform"
                  >
                    <Heart className={`h-5 w-5 ${post.liked_by_user ? "fill-red-500 text-red-500" : "text-white"}`} />
                  </button>

                  {/* Place name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">{post.place_name}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-slate-900 dark:text-slate-100 font-medium mb-3 line-clamp-3">
                    {post.caption}
                  </p>
                  {/* </CHANGE> */}

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">by {post.user_name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(post.created_at)}</span>
                  </div>

                  {/* Like and Comment Buttons */}
                  <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 text-sm hover:text-red-500 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${post.liked_by_user ? "fill-red-500 text-red-500" : ""}`} />
                      <span className="font-medium">{post.likes_count}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-sm hover:text-teal-600 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments === post.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                          {loadingComments === post.id ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                            </div>
                          ) : post.comments && post.comments.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="text-sm">
                                  <span className="font-medium text-slate-900 dark:text-white">
                                    {comment.user_name}
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{comment.comment}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(comment.created_at)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">No comments yet</p>
                          )}

                          {/* Comment Input */}
                          {user && (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handlePostComment(post.id)
                                  }
                                }}
                                disabled={postingComment === post.id}
                                className="text-sm h-9"
                              />
                              <Button
                                size="sm"
                                onClick={() => handlePostComment(post.id)}
                                disabled={postingComment === post.id || !newComment.trim()}
                                className="h-9 px-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                              >
                                {postingComment === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl glass border border-border/50 bg-card p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Share Your Experience</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)} disabled={uploading}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Photo</Label>
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload an image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* Place Name */}
                <div>
                  <Label htmlFor="place-name" className="text-sm font-medium mb-2 block">
                    Place Name
                  </Label>
                  <Input
                    id="place-name"
                    placeholder="e.g., Taj Mahal, Goa Beach, Ladakh"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    required
                    disabled={uploading}
                    className="h-12"
                  />
                </div>

                {/* Caption */}
                <div>
                  <Label htmlFor="caption" className="text-sm font-medium mb-2 block">
                    Caption
                  </Label>
                  <Textarea
                    id="caption"
                    placeholder="Share your experience, tips, or thoughts about this place..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                    disabled={uploading}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={uploading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || !imageFile || !placeName || !caption}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      "Share Post"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
