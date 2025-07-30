"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Clock, Pause } from 'lucide-react';
import { Music, getMusicByArtist, getAllMusic } from '@/lib/api/music';
import { User } from '@/lib/api/auth';
import { useAuth } from '@/lib/store/auth-context';
import usePlayer from '@/hooks/use-player';

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ArtistPage({ params }: PageProps) {
  // Properly unwrap params using React.use()
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  
  const { token } = useAuth();
  const player = usePlayer();
  const [artist, setArtist] = useState<User | null>(null);
  const [artistSongs, setArtistSongs] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Set our local playing state based on browser audio
    const audio = document.querySelector('audio');
    if (audio) {
      setIsPlaying(!audio.paused);
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        // Get all music and filter to find artist info and songs
        const allMusic = await getAllMusic();
        const artistMusic = allMusic.filter(song => song.artist?.id === id);
        
        if (artistMusic.length > 0 && artistMusic[0].artist) {
          // Create a User object with required fields
          const artistData: User = {
            id: artistMusic[0].artist.id,
            username: artistMusic[0].artist.username,
            fullname: artistMusic[0].artist.fullname,
            userProfilePic: artistMusic[0].artist.userProfilePic,
            email: "", // Required field in User type but not available from music API
            createdAt: "" // Required field in User type but not available from music API
          };
          setArtist(artistData);
          setArtistSongs(artistMusic);
        } else {
          console.error('Artist not found or has no music');
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  const handlePlay = (songId: string) => {
    if (!artistSongs.length) return;
    
    // Check if we're already playing this song
    const isSameSong = player.activeId === songId;
    
    // Only update player IDs and active ID if it's a different song
    if (!isSameSong) {
      // Set all artist songs to player
      const songIds = artistSongs.map(song => song.id);
      player.setIds(songIds);
      
      // Set active song
      player.setId(songId);
    }
    
    // Trigger play
    const event = new CustomEvent('musicPlay', { 
      detail: { 
        id: songId,
        artistId: id,
        toggle: isSameSong // Tell the player to toggle if it's the same song
      } 
    });
    document.dispatchEvent(event);
  };

  const playAll = () => {
    if (!artistSongs.length) return;
    
    // Add all songs to player
    const songIds = artistSongs.map(song => song.id);
    player.setIds(songIds);
    
    // Start with first song
    const firstSongId = artistSongs[0].id;
    player.setId(firstSongId);
    
    // Trigger play
    const event = new CustomEvent('musicPlay', { 
      detail: { 
        id: firstSongId,
        artistId: id,
        toggle: false // Always play when "Play All" is clicked
      } 
    });
    document.dispatchEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Artist Not Found</h2>
        <p className="text-gray-400 mt-2">The artist you're looking for doesn't exist or has no music.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Artist Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-gradient-to-b from-[#333] to-transparent pb-6 pt-12 px-4">
        <div className="relative h-48 w-48 rounded-full overflow-hidden shadow-xl">
          <Image
            src={artist?.userProfilePic || "https://via.placeholder.com/400"}
            alt={artist?.fullname || artist?.username || "Artist"}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-white/80 uppercase font-medium">Artist</p>
          <h1 className="text-4xl font-bold mt-1">{artist?.fullname || artist?.username}</h1>
          <p className="text-gray-300 mt-2">
            {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {/* Play All Button */}
      <div className="px-4">
        <button
          onClick={playAll}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 flex items-center gap-2 transition-colors"
          disabled={artistSongs.length === 0}
        >
          <Play size={20} /> Play All
        </button>
      </div>

      {/* Songs List */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">Songs</h2>
        {artistSongs.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-[#333]">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium text-right">
                  <Clock size={16} />
                </th>
              </tr>
            </thead>
            <tbody>
              {artistSongs.map((song, index) => {
                const isCurrentlyPlaying = player.activeId === song.id && isPlaying;
                return (
                  <tr key={song.id} className="hover:bg-[#282828] group">
                    <td className="py-3 w-12">
                      <div className="relative">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <button
                          onClick={() => handlePlay(song.id)}
                          className="hidden group-hover:block absolute top-0 left-0"
                        >
                          {isCurrentlyPlaying ? <Pause size={16} className="text-primary" /> : <Play size={16} className={player.activeId === song.id ? 'text-primary' : ''} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 mr-3">
                          <Image
                            src={song.musicPoster || 'https://via.placeholder.com/60'}
                            alt={song.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <span className={`font-medium ${player.activeId === song.id ? 'text-primary' : ''}`}>
                          {song.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 text-right">
                      {formatDuration(song.duration || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            This artist hasn't uploaded any songs yet.
          </div>
        )}
      </div>
    </div>
  );
} 