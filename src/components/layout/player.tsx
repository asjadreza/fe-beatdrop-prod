"use client"

import { useState } from "react"
import usePlayer from "@/hooks/use-player"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, SkipBack, SkipForward, Play, Pause } from "lucide-react"

export function Player() {
  const player = usePlayer()
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const Icon = isPlaying ? Pause : Play
  const VolumeIcon = volume === 0 ? VolumeX : Volume2

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return
    }

    const currentIndex = player.ids.findIndex((id: string) => id === player.activeId)
    const nextSong = player.ids[currentIndex + 1]

    if (!nextSong) {
      return player.setId(player.ids[0])
    }

    player.setId(nextSong)
  }

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return
    }

    const currentIndex = player.ids.findIndex((id: string) => id === player.activeId)
    const previousSong = player.ids[currentIndex - 1]

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1])
    }

    player.setId(previousSong)
  }

  const handlePlay = async () => {
    if (!player.activeId) {
      return
    }

    // Record play count when toggling play from pause
    if (!isPlaying) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music/${player.activeId}/play`, {
          method: "POST",
        })
      } catch (error) {
        console.error("Error recording play:", error)
      }
    }

    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1)
    } else {
      setVolume(0)
    }
  }

  return (
    <div className="fixed bottom-0 bg-black h-[80px] px-4 py-2 w-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center w-[30%]">
          <div className="flex flex-col gap-y-1">
            <p className="text-white font-medium truncate">
              {player.activeId}
            </p>
            <p className="text-neutral-400 text-sm truncate">
              Artist
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center w-[40%]">
          <div className="flex items-center gap-x-6">
            <Button
              onClick={onPlayPrevious}
              size="icon"
              variant="ghost"
              className="text-neutral-400 hover:text-white"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              onClick={handlePlay}
              size="icon"
              variant="ghost"
              className="text-neutral-400 hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </Button>
            <Button
              onClick={onPlayNext}
              size="icon"
              variant="ghost"
              className="text-neutral-400 hover:text-white"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-end w-[30%] gap-x-2">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer text-neutral-400 hover:text-white"
            size={34}
          />
          <Slider
            value={[volume]}
            onValueChange={(value: number[]) => setVolume(value[0])}
            max={1}
            step={0.1}
            className="w-[100px]"
          />
        </div>
      </div>
    </div>
  )
} 