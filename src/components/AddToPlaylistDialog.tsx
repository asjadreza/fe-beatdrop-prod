"use client"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { addMusicToPlaylist, getMyPlaylists, Playlist } from "@/lib/api/playlist"
import { useAuth } from "@/lib/store/auth-context"
import { toast } from "@/components/ui/use-toast"

interface AddToPlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  musicId: string
}

export function AddToPlaylistDialog({ 
  open, 
  onOpenChange,
  musicId 
}: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!token || !open) return
      
      try {
        setLoading(true)
        const fetchedPlaylists = await getMyPlaylists(token)
        setPlaylists(fetchedPlaylists)
      } catch (error) {
        console.error("Error fetching playlists:", error)
        toast({
          title: "Failed to load playlists",
          description: "Please try again later",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [token, open])

  const handleAddToPlaylist = async () => {
    if (!token || !selectedPlaylistId || !musicId) return
    
    try {
      setAdding(true)
      await addMusicToPlaylist(selectedPlaylistId, musicId, token)
      toast({
        title: "Added to playlist",
        description: "The track has been added to your playlist"
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding track to playlist:", error)
      toast({
        title: "Failed to add to playlist",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setAdding(false)
    }
  }

  const handleCreateNewPlaylist = () => {
    // This could navigate to the create playlist page
    // For now, just close the dialog
    onOpenChange(false)
    // You could use router.push('/main/playlists/new') here
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">Add to playlist</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Select a playlist to add this track to
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
          </div>
        ) : (
          <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => setSelectedPlaylistId(playlist.id)}
                  className={`
                    flex items-center p-3 rounded-md cursor-pointer
                    ${selectedPlaylistId === playlist.id 
                      ? 'bg-green-500 text-white' 
                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white'}
                  `}
                >
                  <div className="h-12 w-12 mr-3 rounded overflow-hidden">
                    {playlist.coverImage ? (
                      <img
                        src={playlist.coverImage}
                        alt={playlist.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
                        <PlusCircle className="h-6 w-6 text-neutral-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{playlist.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {playlist._count?.music || 0} tracks
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                You don't have any playlists yet.
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCreateNewPlaylist}
            className="w-full sm:w-auto border-neutral-300 dark:border-neutral-700 text-black dark:text-white"
          >
            Create New Playlist
          </Button>
          <Button
            onClick={handleAddToPlaylist}
            disabled={!selectedPlaylistId || adding || loading}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/50 disabled:text-white/70"
          >
            {adding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            ) : (
              "Add to Playlist"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 