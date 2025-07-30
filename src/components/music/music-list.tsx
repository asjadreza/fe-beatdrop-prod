"use client"

import { useEffect, useState } from "react"
import { Play, Heart, ListPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import usePlayer from "@/hooks/use-player"
import { AddToPlaylistDialog } from "@/components/AddToPlaylistDialog"

interface Music {
  id: string
  title: string
  artist: {
    fullname: string
    id: string
    userProfilePic: string
    username: string
  }
  musicFile: string
  musicPoster: string
  likes?: number
}

export function MusicList() {
  const player = usePlayer()
  const [music, setMusic] = useState<Music[]>([])
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false)
  const [selectedMusicId, setSelectedMusicId] = useState<string>("")

  useEffect(() => {
    // TODO: Fetch music from API
    const fetchMusic = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music`)
        const data = await response.json()
        // setMusic(data?.music)
        setMusic(data?.music?.slice(0, 4) || [])
      } catch (error) {
        console.error("Error fetching music:", error)
      }
    }

    fetchMusic()
  }, [])

  const onPlay = async (id: string) => {
    // Check if it's the same song to toggle play/pause
    const isSameSong = player.activeId === id;
    
    // Record play count on the server
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music/${id}/play`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error recording play:", error)
    }
    
    // If it's not the same song or there are no IDs yet, set the IDs
    if (!isSameSong || !player.ids.length) {
      // Set all music IDs to the player for navigation
      if (music.length > 0) {
        player.setIds(music.map(item => item.id));
      }
      
      // Set the active ID (only change this if it's a different song)
      if (!isSameSong) {
        player.setId(id);
      }
    }
    
    // Trigger playing state in any components using the player state
    // Pass toggle: true if it's the same song to toggle play/pause
    const event = new CustomEvent('musicPlay', { 
      detail: { 
        id, 
        toggle: isSameSong 
      } 
    });
    document.dispatchEvent(event);
  }

  const onLike = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music/${id}/like`, {
        method: "POST",
      })
      // TODO: Update UI to reflect like status
    } catch (error) {
      console.error("Error liking music:", error)
    }
  }

  const onAddToPlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent click from propagating to parent
    setSelectedMusicId(id)
    setAddToPlaylistOpen(true)
  }

  console.log("music", music)



  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {music.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
          >
            <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
              <img
                src={item.musicPoster}
                alt={item.title}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start w-full pt-4 gap-y-1">
              <p className="font-semibold truncate w-full">
                {item.title}
              </p>
              <p className="text-neutral-400 text-sm pb-4 w-full truncate">
                {item.artist.fullname}
              </p>
            </div>
            <div className="absolute bottom-24 right-5">
              <Button
                onClick={() => onPlay(item.id)}
                className="transition opacity-0 rounded-full flex items-center bg-green-500 p-4 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110"
              >
                <Play className="text-black" />
              </Button>
            </div>
            <div className="absolute bottom-24 right-20">
              <Button
                onClick={() => onLike(item.id)}
                className="transition opacity-0 rounded-full flex items-center bg-white p-4 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110"
              >
                <Heart className="text-black" />
              </Button>
            </div>
            <div className="absolute bottom-24 right-36">
              <Button
                onClick={(e) => onAddToPlaylist(item.id, e)}
                className="transition opacity-0 rounded-full flex items-center bg-blue-500 p-4 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110"
              >
                <ListPlus className="text-white" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AddToPlaylistDialog
        open={addToPlaylistOpen}
        onOpenChange={setAddToPlaylistOpen}
        musicId={selectedMusicId}
      />
    </>
  )
} 