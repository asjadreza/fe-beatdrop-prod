"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, PlayCircle, Heart, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePlayer from "@/hooks/use-player";
import { AddToPlaylistDialog } from "@/components/AddToPlaylistDialog";

interface Music {
  id: string;
  title: string;
  artist: {
    fullname: string;
    id: string;
    userProfilePic: string;
    username: string;
  };
  musicFile: string;
  musicPoster: string;
  likes?: number;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  _count?: {
    music: number;
  };
  user?: {
    fullname: string;
  };
  music?: Array<{
    music: {
      musicPoster: string;
    };
  }>;
}

export default function Explore() {
  const [music, setMusic] = useState<Music[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const player = usePlayer();

  // Categories
  const categories = [
    { id: 1, name: "All" },
    { id: 2, name: "Music" },
    { id: 3, name: "Playlists" },
  ];

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch music and playlists from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch music
        const musicResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/music`
        );
        const musicData = await musicResponse.json();
        setMusic(musicData?.music || []);

        // Attempt to fetch user's playlists if logged in
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const playlistsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/playlists/me`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (playlistsResponse.ok) {
              const playlistsData = await playlistsResponse.json();
              setPlaylists(playlistsData?.playlists || []);
            }
          } catch (playlistError) {
            console.error("Error fetching playlists:", playlistError);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onPlay = (id: string) => {
    // Check if it's the same song to toggle play/pause
    const isSameSong = player.activeId === id;

    // If it's not the same song or there are no IDs yet, set the IDs
    if (!isSameSong || !player.ids.length) {
      // Set all music IDs to the player for navigation
      if (music.length > 0) {
        player.setIds(music.map((item) => item.id));
      }

      // Set the active ID (only change this if it's a different song)
      if (!isSameSong) {
        player.setId(id);
      }
    }

    // Trigger playing state in any components using the player state
    // Pass toggle: true if it's the same song to toggle play/pause
    const event = new CustomEvent("musicPlay", {
      detail: {
        id,
        toggle: isSameSong,
      },
    });
    document.dispatchEvent(event);
  };

  const onLike = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music/${id}/like`, {
        method: "POST",
      });
      // TODO: Update UI to reflect like status
    } catch (error) {
      console.error("Error liking music:", error);
    }
  };

  const onAddToPlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating to parent
    setSelectedMusicId(id);
    setAddToPlaylistOpen(true);
  };

  console.log("playlists", playlists);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-6">Explore</h1>

        <div className="flex items-center space-x-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              className="bg-[#2a2a2a] hover:bg-[#333] text-white px-6 py-2 rounded-full transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Trending Music Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Trending Music</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {music.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
                  >
                    <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
                      <img
                        src={
                          item.musicPoster || "https://via.placeholder.com/300"
                        }
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
            </div>

            {/* Playlists Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>
              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.slice(0, 6).map((playlist) => (
                    <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                      <div className="group bg-[#181818] rounded-lg overflow-hidden hover:bg-[#282828] transition-colors">
                        <div className="relative h-48 w-full">
                          {playlist.music && playlist.music.length > 0 ? (
                            <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                              {Array.from({ length: 4 }).map((_, index) => {
                                // Get the poster or repeat if fewer than 4 songs
                                const posterIndex = index % playlist.music!.length;
                                const poster = playlist.music![posterIndex].music.musicPoster;
                                
                                return (
                                  <div key={index} className="relative overflow-hidden">
                                    <Image
                                      src={poster || "https://via.placeholder.com/300"}
                                      alt={`Track ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <Image
                              src={"https://via.placeholder.com/300"}
                              alt={playlist.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-[#1DB954] text-white p-3 rounded-full transform transition-transform hover:scale-105">
                              <PlayCircle className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold">
                            {playlist.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {playlist.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {playlist._count?.music || 0} tracks •{" "}
                            {playlist.user?.fullname || "Unknown creator"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-[#181818] rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    No Playlists Found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    You haven't created any playlists yet.
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Music Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {music.slice(5, 10).map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
                  >
                    <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
                      <img
                        src={
                          item.musicPoster || "https://via.placeholder.com/300"
                        }
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
            </div>
          </>
        )}
      </section>

      <AddToPlaylistDialog
        open={addToPlaylistOpen}
        onOpenChange={setAddToPlaylistOpen}
        musicId={selectedMusicId}
      />
    </div>
  );
}
