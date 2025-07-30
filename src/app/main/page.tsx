import { MusicList } from "@/components/music/music-list"
import { CurrentlyPlaying } from "@/components/music/currently-playing"
import { PlaylistList } from "@/components/playlist/playlist-list"

export default function MainPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4 font-noto">ADD • LISTEN • ENJOY</h2>
        {/* <p className="text-neutral-400">
          Listen to your favorite music and create playlists
        </p> */}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Recently Added</h3>
        <MusicList />
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Currently Playing</h3>
        <CurrentlyPlaying />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Your Playlists</h3>
        <PlaylistList />
      </div>
    </div>
  )
} 