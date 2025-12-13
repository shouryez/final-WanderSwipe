// wanderswipe/lib/imageFallback.ts
export function placeImageUrl(primaryUrl?: string | null, name?: string) {
    if (primaryUrl) return primaryUrl;
    if (!name) return "/images/placeholder.jpg";
    const q = encodeURIComponent(name + " travel");
    return `https://source.unsplash.com/featured/?${q}`;
  }
