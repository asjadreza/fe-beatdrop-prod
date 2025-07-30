"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, User2, Pause } from 'lucide-react';
import { getPlaylistById, Playlist } from '@/lib/api/playlist';
import usePlayer from '@/hooks/use-player';

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Array of gradient backgrounds
const gradientBackgrounds = [
  'linear-gradient(90deg, rgba(94, 146, 168, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%)',
  'linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%)',
  'linear-gradient(90deg, rgba(66, 133, 244, 1) 0%, rgba(52, 168, 83, 1) 33%, rgba(251, 188, 5, 1) 66%, rgba(234, 67, 53, 1) 100%)',
  'linear-gradient(90deg, rgba(50, 173, 230, 1) 0%, rgba(97, 87, 255, 1) 50%, rgba(189, 0, 255, 1) 100%)',
  'linear-gradient(90deg, rgba(255, 105, 180, 1) 0%, rgba(255, 182, 193, 1) 50%, rgba(255, 218, 185, 1) 100%)'
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PlaylistPage({ params }: PageProps) {
  // Properly unwrap params using React.use()
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const player = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGradient, setCurrentGradient] = useState(0);

  useEffect(() => {
    // Rotate through the gradients every 5 seconds
    const intervalId = setInterval(() => {
      setCurrentGradient((prev) => (prev + 1) % gradientBackgrounds.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

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
    const fetchPlaylistData = async () => {
      setIsLoading(true);
      try {
        const playlistData = await getPlaylistById(id);
        setPlaylist(playlistData);
      } catch (error) {
        console.error('Error fetching playlist data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id]);

  const handlePlay = (songId: string) => {
    if (!playlist || !playlist.music || playlist.music.length === 0) return;
    
    // If we're already playing this song, we'll toggle play/pause
    const isSameSong = player.activeId === songId;
    
    // Only update player IDs and active ID if it's a different song
    if (!isSameSong) {
      // Get all music IDs from the playlist
      const songIds = playlist.music.map(item => item.music.id);
      
      // Set player IDs
      player.setIds(songIds);
      
      // Set active song ID
      player.setId(songId);
    }
    
    // Trigger play event
    const event = new CustomEvent('musicPlay', { 
      detail: { 
        id: songId,
        playlistId: id,
        toggle: isSameSong // Tell the player to toggle if it's the same song
      } 
    });
    document.dispatchEvent(event);
  };

  const playAll = () => {
    if (!playlist || !playlist.music || playlist.music.length === 0) return;
    
    // Get all music IDs
    const songIds = playlist.music.map(item => item.music.id);
    
    // Set player IDs
    player.setIds(songIds);
    
    // Set active ID to first song
    const firstSongId = playlist.music[0].music.id;
    player.setId(firstSongId);
    
    // Trigger play event
    const event = new CustomEvent('musicPlay', { 
      detail: { 
        id: firstSongId,
        playlistId: id,
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

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Playlist Not Found</h2>
        <p className="text-gray-400 mt-2">The playlist you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
      </div>
    );
  }

  console.log("playlist", playlist);

  return (
    <div className="space-y-8">
      {/* Playlist Header */}
      <div 
        className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 pt-12 px-4"
        style={{ background: gradientBackgrounds[currentGradient] }}
      >
        <div className="relative h-48 w-48 overflow-hidden shadow-xl">
          {playlist.music && playlist.music.length > 0 ? (
            <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
              {/* Generate 4 grid cells, repeating songs if needed */}
              {Array.from({ length: 4 }).map((_, index) => {
                // Make sure playlist.music exists and has items
                if (playlist.music && playlist.music.length > 0) {
                  // Calculate which song to show (with repetition)
                  const songIndex = index % playlist.music.length;
                  const song = playlist.music[songIndex].music;
                  
                  return (
                    <div key={`song-${index}`} className="relative h-full w-full">
                      <Image
                        src={song.musicPoster || ""}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                }
                return null; // This shouldn't happen due to the outer check
              })}
            </div>
          ) : (
            <Image
              src={playlist.coverImage || "https://via.placeholder.com/400"}
              alt={playlist.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-white/80 uppercase font-medium">Playlist</p>
          <h1 className="text-4xl font-bold mt-1">{playlist.title}</h1>
          <p className="text-gray-300 mt-1">{playlist.description}</p>
          {playlist.user && (
            <p className="flex items-center gap-1 mt-2 text-sm">
              <User2 size={14} />
              <Link href={`/artist/${playlist.user.id}`} className="hover:underline">
                {playlist.user.fullname || playlist.user.username}
              </Link>
              {' • '} 
              {playlist.music?.length || 0} {(playlist.music?.length || 0) === 1 ? 'song' : 'songs'}
            </p>
          )}
        </div>
      </div>

      {/* Play All Button */}
      <div className="px-4">
        <button
          onClick={playAll}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 flex items-center gap-2 cursor-pointer transition-colors"
          disabled={!playlist.music?.length}
        >
          <Play size={20} /> Play All
        </button>
      </div>

      {/* Songs List */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">Songs</h2>
        {playlist.music && playlist.music.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-[#333]">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium hidden md:table-cell">Artist</th>
                <th className="pb-2 font-medium text-right">
                  <div className="flex justify-end items-center pr-1">
                    <Clock size={16} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {playlist.music.map((item, index) => {
                const isSongPlaying = player.activeId === item.music.id && isPlaying;
                return (
                  <tr key={item.music.id} className=" group">
                    <td className="py-3 w-12">
                      <div className="relative">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <button
                          onClick={() => handlePlay(item.music.id)}
                          className="hidden group-hover:block absolute top-0 left-0"
                        >
                          {isSongPlaying ? <Pause size={16} className="text-primary" /> : <Play size={16} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="relative h-10 w-10 mr-3">
                          <Image
                            src={item.music.musicPoster || 'https://via.placeholder.com/60'}
                            alt={item.music.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <span className={`font-medium ${player.activeId === item.music.id ? 'text-primary' : ''}`}>
                          {item.music.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400 hidden md:table-cell">
                      <Link href={`/artist/${item.music.artist.id}`} className="hover:underline">
                        {item.music.artist.fullname || item.music.artist.username}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-400 text-right">
                      {formatDuration(item.music.duration || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            This playlist is empty.
          </div>
        )}
      </div>
    </div>
  );
} 