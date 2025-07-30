"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ListMusic,
  Music,
  User2,
  Play,
  Clock,
  Pause,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import {
  getAllMusic,
  Music as MusicType,
  getMyUploads,
  deleteMusic,
  editMusic,
} from "@/lib/api/music";
import { getMyPlaylists, Playlist as PlaylistType } from "@/lib/api/playlist";
import { User } from "@/lib/api/auth";
import usePlayer from "@/hooks/use-player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface EditMusicModalProps {
  music: MusicType;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMusicModal: React.FC<EditMusicModalProps> = ({
  music,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const musicFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);

  const handleEditMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleRef.current?.value) {
      toast({
        title: "Missing title",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);

    try {
      if (!token) {
        throw new Error("You must be logged in to edit music");
      }

      await editMusic(
        music.id,
        {
          title: titleRef.current.value,
          musicFile: musicFileRef.current?.files?.[0],
          musicPoster: posterFileRef.current?.files?.[0],
        },
        token
      );

      toast({ title: "Success", description: "Music updated successfully!" });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] rounded-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-white">Edit Music</h2>
        <form onSubmit={handleEditMusic} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">
              Title
            </Label>
            <Input
              id="title"
              ref={titleRef}
              className="mt-1 bg-[#2a2a2a] text-white"
              defaultValue={music.title}
              required
            />
          </div>
          <div>
            <Label htmlFor="musicFile" className="text-white">
              Music File (optional)
            </Label>
            <Input
              id="musicFile"
              type="file"
              accept="audio/*"
              ref={musicFileRef}
              className="mt-1 bg-[#2a2a2a] text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Current file: {music.musicFile.split("/").pop()}
            </p>
          </div>
          <div>
            <Label htmlFor="musicPoster" className="text-white">
              Poster (optional)
            </Label>
            <Input
              id="musicPoster"
              type="file"
              accept="image/*"
              ref={posterFileRef}
              className="mt-1 bg-[#2a2a2a] text-white"
            />
            {music.musicPoster && (
              <p className="text-xs text-gray-400 mt-1">
                Current poster: {music.musicPoster.split("/").pop()}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isEditing}
          >
            {isEditing ? "Updating..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Separate EditModal Container that will be rendered outside the table structure
const EditModalContainer: React.FC<{
  showModal: boolean;
  music: MusicType | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ showModal, music, onClose, onSuccess }) => {
  if (!showModal || !music) return null;

  return (
    <EditMusicModal music={music} onClose={onClose} onSuccess={onSuccess} />
  );
};

interface PlaylistCardProps {
  playlist: PlaylistType;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <Link href={`/playlist/${playlist.id}`} className="block">
      <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-md">
          <Image
            src={playlist.coverImage || "https://via.placeholder.com/200"}
            alt={playlist.title}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="font-semibold truncate">{playlist.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mt-1">
          {playlist.description ||
            `Playlist • ${playlist._count?.music || 0} songs`}
        </p>
      </div>
    </Link>
  );
};

interface ArtistCardProps {
  artist: User;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link href={`/artist/${artist.id}`} className="block">
      <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all text-center">
        <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full shadow-md">
          <Image
            src={artist.userProfilePic || "https://via.placeholder.com/200"}
            alt={artist.fullname || artist.username}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="font-semibold truncate">
          {artist.fullname || artist.username}
        </h3>
        <p className="text-sm text-gray-400 mt-1">Artist</p>
      </div>
    </Link>
  );
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function Library() {
  const { user, token, isAuthenticated } = useAuth();
  const player = usePlayer();
  const [songs, setSongs] = useState<MusicType[]>([]);
  const [downloadedSongs, setDownloadedSongs] = useState<MusicType[]>([]);
  const [uploadedSongs, setUploadedSongs] = useState<MusicType[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("songs");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [editModalMusic, setEditModalMusic] = useState<MusicType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Listen for audio play/pause state
  useEffect(() => {
    const audio = document.querySelector("audio");
    if (audio) {
      setAudioIsPlaying(!audio.paused);

      const handlePlay = () => setAudioIsPlaying(true);
      const handlePause = () => setAudioIsPlaying(false);

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);

      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
      };
    }
  }, []);

  // Fetch all music and user playlists
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all music
      const musicData = await getAllMusic();
      setSongs(musicData);

      // Extract unique artists from music data
      const uniqueArtists = Array.from(
        new Map(
          musicData
            .filter((song) => song.artist)
            .map((song) => [song.artist!.id, song.artist!])
        ).values()
      ) as User[];
      setArtists(uniqueArtists);

      // If user is authenticated, fetch their playlists and uploads
      if (token) {
        const playlistsData = await getMyPlaylists(token);
        setPlaylists(playlistsData);

        if (user?.id) {
          const uploads = await getMyUploads(user.id);
          setUploadedSongs(uploads);
        }
      }

      // In a real application, you would fetch downloaded songs from local storage
      // or from a specific API endpoint. This is a placeholder.
      setDownloadedSongs([]);
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [token, user?.id]);

  // Handle playing a song
  const handlePlay = (songs: MusicType[], songId: string) => {
    // Check if we're already playing this song
    const isSameSong = player.activeId === songId;

    // If it's not the same song or we have songs array, update the IDs
    if (!isSameSong || songs.length > 0) {
      // If songs array is provided, set those IDs
      if (songs.length > 0) {
        const songIds = songs.map((song) => song.id);
        player.setIds(songIds);
      } else if (songId && !player.ids.includes(songId)) {
        // If we're just playing one song, add it to the player's IDs if it's not already there
        player.setIds([...player.ids, songId]);
      }

      // Only set the ID if it's a different song
      if (!isSameSong) {
        player.setId(songId);
      }
    }

    // Trigger play event for the player
    const event = new CustomEvent("musicPlay", {
      detail: {
        id: songId,
        toggle: isSameSong, // Tell the player to toggle if it's the same song
      },
    });
    document.dispatchEvent(event);
  };

  interface SongItemProps {
    song: MusicType;
    onPlay: (songs: MusicType[], songId: string) => void;
    isPlaying: boolean;
    showActions?: boolean;
    onDeleteSuccess?: () => void;
  }

  const SongItem: React.FC<SongItemProps> = ({
    song,
    onPlay,
    isPlaying,
    showActions = false,
    onDeleteSuccess,
  }) => {
    const { user, token } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = user?.id === song.artistId;

    const handleDelete = async () => {
      if (!token) return;

      if (confirm("Are you sure you want to delete this track?")) {
        setIsDeleting(true);
        try {
          await deleteMusic(song.id, token);
          toast({
            title: "Success",
            description: "Track deleted successfully",
          });
          if (onDeleteSuccess) onDeleteSuccess();
        } catch (err: any) {
          toast({
            title: "Delete failed",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setIsDeleting(false);
        }
      }
    };

    const handleEdit = () => {
      setEditModalMusic(song);
      setShowEditModal(true);
    };

    return (
      <tr className="hover:bg-[#282828] group">
        <td className="py-3">
          <div className="flex items-center">
            <div className="relative h-10 w-10 mr-3 group-hover:opacity-70">
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay([], song.id);
                  }}
                  className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
              <Image
                src={song.musicPoster || "https://via.placeholder.com/60"}
                alt={song.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <span className={`font-medium ${isPlaying ? "text-primary" : ""}`}>
              {song.title}
            </span>
          </div>
        </td>
        <td className="py-3 text-gray-400 hidden md:table-cell">
          <Link href={`/artist/${song.artist?.id}`} className="hover:underline">
            {song.artist?.fullname || song.artist?.username || "Unknown Artist"}
          </Link>
        </td>
        <td className="py-3 text-gray-400 text-right">
          {showActions && isOwner ? (
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={handleEdit}
                className="p-1 hover:text-white"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:text-red-500"
                title="Delete"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            formatDuration(song.duration || 0)
          )}
        </td>
      </tr>
    );
  };

  const filterButtons = [
    { id: "playlists", label: "Playlists", icon: ListMusic },
    { id: "songs", label: "Songs", icon: Music },
    { id: "artists", label: "Artists", icon: User2 },
  ];

  const renderSongList = (songs: MusicType[], showActions = false) => (
    <div className="mt-4">
      {songs.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-[#333]">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium hidden md:table-cell">Artist</th>
              <th className="pb-2 font-medium text-right">
                <div className="flex justify-end items-center pr-1">
                  {showActions ? 'Actions' : <Clock size={16} />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <SongItem
                key={song.id}
                song={song}
                onPlay={handlePlay}
                isPlaying={player.activeId === song.id && audioIsPlaying}
                showActions={showActions}
                onDeleteSuccess={fetchData}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No songs found.</p>
        </div>
      )}
    </div>
  );

  const renderPlaylists = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
      {playlists.length > 0 ? (
        playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No playlists found.</p>
        </div>
      )}
    </div>
  );

  const renderArtists = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
      {artists.length > 0 ? (
        artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No artists found.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="flex space-x-6 mb-6 bg-transparent justify-start">
          <TabsTrigger
            value="library"
            className="px-0 py-2 text-sm font-medium data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white text-gray-400 rounded-none hover:text-white"
          >
            LIBRARY
          </TabsTrigger>
          <TabsTrigger
            value="downloads"
            className="px-0 py-2 text-sm font-medium data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white text-gray-400 rounded-none hover:text-white"
          >
            DOWNLOADS
          </TabsTrigger>
          <TabsTrigger
            value="uploads"
            className="px-0 py-2 text-sm font-medium data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white text-gray-400 rounded-none hover:text-white"
          >
            UPLOADS
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {filterButtons.map((button) => {
              const Icon = button.icon;
              return (
                <button
                  key={button.id}
                  className={`flex items-center ${
                    activeFilter === button.id ? "bg-[#3a3a3a]" : "bg-[#2a2a2a]"
                  } hover:bg-[#333] text-white px-4 py-2 rounded-full transition-colors`}
                  onClick={() => setActiveFilter(button.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span>{button.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <TabsContent value="library" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {activeFilter === "songs" && renderSongList(songs)}
              {activeFilter === "playlists" && renderPlaylists()}
              {activeFilter === "artists" && renderArtists()}
            </>
          )}
        </TabsContent>

        <TabsContent value="downloads" className="mt-0">
          {isAuthenticated ? (
            isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : downloadedSongs.length > 0 ? (
              renderSongList(downloadedSongs)
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  You haven't downloaded any songs yet.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                Please log in to view your downloaded songs.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="uploads" className="mt-0">
          {isAuthenticated ? (
            isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : uploadedSongs.length > 0 ? (
              renderSongList(uploadedSongs, true)
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  You haven't uploaded any music yet.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                Please log in to view your uploaded songs.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Render edit modal outside the table structure */}
      <EditModalContainer
        showModal={showEditModal}
        music={editModalMusic}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
