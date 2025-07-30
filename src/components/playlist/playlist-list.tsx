"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/store/auth-context"

interface Playlist {
  id: string
  name: string
  description: string
  imageUrl: string
}

export function PlaylistList() {
  const router = useRouter()
  const { token } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch playlists from API
    const fetchPlaylists = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/playlists/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch playlists')
        }
        
        const data = await response.json()
        setPlaylists(data)
      } catch (error) {
        console.error("Error fetching playlists:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaylists()
  }, [token])

  const onCreatePlaylist = () => {
    router.push("/main/playlists/new")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        onClick={onCreatePlaylist}
        className="group relative flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
      >
        <div className="relative aspect-square w-full h-full rounded-md overflow-hidden flex items-center justify-center">
          <Plus className="h-10 w-10 text-neutral-400" />
        </div>
        <div className="flex flex-col items-start w-full pt-4 gap-y-1">
          <p className="font-semibold truncate w-full">
            Create New Playlist
          </p>
          <p className="text-neutral-400 text-sm pb-4 w-full truncate">
            Add a new playlist to your collection
          </p>
        </div>
      </div>
      {playlists.length > 0 ? (
        playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => router.push(`/main/playlists/${playlist.id}`)}
            className="group relative flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
          >
            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
              <p className="font-semibold truncate w-full">
                {playlist.name}
              </p>
              <p className="text-neutral-400 text-sm pb-4 w-full truncate">
                {playlist.description}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-neutral-400 py-10">
          No playlists found. Create your first playlist!
        </div>
      )}
    </div>
  )
} 