"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, ListPlus } from 'lucide-react';
import usePlayer from "@/hooks/use-player";
import { Slider } from "@/components/ui/slider";
import { AddToPlaylistDialog } from "@/components/AddToPlaylistDialog";

const MusicPlayer = () => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [songData, setSongData] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Add ref for tracking loading state to prevent race conditions
  const isLoadingRef = useRef(false);
  // Track play requests that come in during loading
  const pendingPlayRequestRef = useRef(false);

  const Icon = isPlaying ? Pause : Play;
  const VolumeIcon = volume === 0 ? VolumeX : Volume2;

  // Initialize from localStorage on first load
  useEffect(() => {
    const savedSongId = localStorage.getItem('lastPlayedSongId');
    if (savedSongId && !player.activeId) {
      player.setId(savedSongId);
      
      // Restore the IDs array if available
      const savedIds = localStorage.getItem('playerIds');
      if (savedIds) {
        try {
          const idsArray = JSON.parse(savedIds);
          if (Array.isArray(idsArray) && idsArray.length > 0) {
            player.setIds(idsArray);
          }
        } catch (error) {
          console.error("Error parsing saved song IDs:", error);
        }
      }
    }
  }, []);

  // Save to localStorage when activeId changes
  useEffect(() => {
    if (player.activeId) {
      localStorage.setItem('lastPlayedSongId', player.activeId);
    }
    
    if (player.ids && player.ids.length > 0) {
      localStorage.setItem('playerIds', JSON.stringify(player.ids));
    }
  }, [player.activeId, player.ids]);

  // Define player control functions first
  const onPlayNext = useCallback(() => {
    if (player.ids.length === 0) {
      return;
    }

    // Need to update this reference in the useEffect cleanup
    if (audioRef.current) {
      // Set audio current time to 0 when switching songs
      audioRef.current.currentTime = 0;
    }

    const currentIndex = player.ids.findIndex((id: string) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      player.setId(player.ids[0]);
    } else {
      player.setId(nextSong);
    }
    
    // Ensure isPlaying is set to true for autoplay
    setTimeout(() => {
      setIsPlaying(true);
    }, 50);
  }, [player]);

  const onPlayPrevious = useCallback(() => {
    if (player.ids.length === 0) {
      return;
    }
    
    // Need to update this reference in the useEffect cleanup
    if (audioRef.current) {
      // Set audio current time to 0 when switching songs
      audioRef.current.currentTime = 0;
    }

    const currentIndex = player.ids.findIndex((id: string) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  }, [player]);

  // Fetch current song data
  useEffect(() => {
    const fetchSongData = async () => {
      if (player.activeId && player.activeId !== 'undefined') {
        try {
          setIsLoading(true);
          isLoadingRef.current = true;
          
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/music/${player.activeId}`;
          console.log("Fetching song from:", apiUrl);
          const response = await fetch(apiUrl);
          const data = await response.json();
          if (data.music) {
            // We assign song data here, which will trigger the other effect to load it
            setSongData(data.music);
          } else {
            console.error("Music data not found in response:", data);
          }
        } catch (error) {
          console.error("Error fetching song data:", error);
        } finally {
          // Allow a small delay before allowing new interactions
          setTimeout(() => {
            setIsLoading(false);
            isLoadingRef.current = false;
            
            // Check if we received a play request during loading
            if ((pendingPlayRequestRef.current || isPlaying) && audioRef.current) {
              pendingPlayRequestRef.current = false;
              audioRef.current.play().catch(err => {
                console.error("Error playing after pending request:", err);
              });
            }
          }, 300);
        }
      }
    };

    if (player.activeId && player.activeId !== 'undefined') {
      fetchSongData();
    } else {
      // Reset song data when no active ID
      setSongData(null);
    }
  }, [player.activeId]); // Only depend on player.activeId changes

  // Handle audio element setup and events - ONLY RUN ONCE
  useEffect(() => {
    // Create audio element only once
    const audio = new Audio();
    audio.preload = "auto"; // Ensure we preload audio data
    audioRef.current = audio;

    // Track playback position
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Call onPlayNext to set the next song as active
      onPlayNext();
      // Explicitly set isPlaying to true to ensure autoplay
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    };
    
    // Add play/pause event listeners
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    // Track loading events
    const handleLoadStart = () => {
      isLoadingRef.current = true;
    };
    
    const handleCanPlayThrough = () => {
      isLoadingRef.current = false;
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    // Cleanup on component unmount
    return () => {
      // Store the current position before unmounting (if needed for persistence)
      // const lastPosition = audio.currentTime;
      // const lastSongId = player.activeId;
      
      // Stop and clean up
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [onPlayNext]); // Need onPlayNext as a dependency since it's used in handleEnded

  // Load song when songData changes - but NOT when volume or play state changes
  useEffect(() => {
    if (songData && audioRef.current) {
      // Make sure we have a valid audio URL
      if (songData.musicFile) {
        const loadAndPlayAudio = async () => {
          try {
            // We need to pause first to prevent interrupted play errors
            if (!audioRef.current) return;
            
            // Check if we're changing the song or just reloading the same song
            const isSameSong = audioRef.current.src && 
              (audioRef.current.src === songData.musicFile || 
               audioRef.current.src.endsWith(encodeURIComponent(songData.musicFile)));
            
            // Remember current position if it's the same song
            const currentPosition = isSameSong ? audioRef.current.currentTime : 0;
            
            // Set the flag to indicate we're loading
            isLoadingRef.current = true;
            setIsLoading(true);
            
            // First pause the audio - await to make sure the pause completes
            await new Promise<void>((resolve) => {
              if (!audioRef.current) {
                resolve();
                return;
              }
              
              // If already paused, resolve immediately
              if (audioRef.current.paused) {
                resolve();
              } else {
                // If playing, wait for pause to complete
                audioRef.current.pause();
                setTimeout(resolve, 50);
              }
            });
            
            // Only reset source if it's a different song
            if (!isSameSong) {
              // Clear any queued audio by emptying the src
              audioRef.current.src = '';
              
              // Small delay to ensure the browser has processed the pause
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Now set the new source
              audioRef.current.src = songData.musicFile;
              audioRef.current.volume = volume;
            }
            
            // Restore position if it's the same song, otherwise start at beginning
            audioRef.current.currentTime = currentPosition;
            
            // Allow a bit more time for the browser to process
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Now we can try to play if needed
            if (isPlaying || pendingPlayRequestRef.current) {
              pendingPlayRequestRef.current = false;
              try {
                // Use a delayed play to avoid race conditions
                setTimeout(async () => {
                  if (audioRef.current) {
                    try {
                      await audioRef.current.play();
                    } catch (error) {
                      console.error("Error playing audio after delay:", error);
                      // Try again with a longer delay
                      setTimeout(async () => {
                        if (audioRef.current) {
                          try {
                            await audioRef.current.play();
                          } catch (innerError) {
                            console.error("Second play attempt failed:", innerError);
                          }
                        }
                      }, 500);
                    }
                  }
                }, 200);
              } catch (error) {
                console.error("Error playing audio:", error);
              }
            }
            
            // Loading complete after a short delay to ensure all operations have settled
            setTimeout(() => {
              isLoadingRef.current = false;
              setIsLoading(false);
            }, 300);
          } catch (error) {
            console.error("Error in load and play sequence:", error);
            isLoadingRef.current = false;
            setIsLoading(false);
          }
        };
        
        loadAndPlayAudio();
      } else {
        console.error("Missing musicFile in songData:", songData);
        setIsPlaying(false);
      }
    }
  }, [songData]); // Only dependency is songData

  // Handle volume change separately without affecting playback position
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause separately without affecting playback position
  useEffect(() => {
    if (!audioRef.current || !songData) return;

    // Don't attempt to play if we're currently loading
    if (isLoadingRef.current) {
      pendingPlayRequestRef.current = isPlaying;
      return;
    }

    if (isPlaying) {
      // Use setTimeout to prevent race conditions
      setTimeout(() => {
        if (audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
              
              // If the audio fails to play, we'll try once more after a short delay
              setTimeout(() => {
                if (audioRef.current && isPlaying) {
                  audioRef.current.play().catch(e => {
                    console.error("Retry play failed:", e);
                    setIsPlaying(false);
                  });
                }
              }, 500);
            });
          }
        }
      }, 100);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, songData]);

  // Listen for play events from elsewhere in the app
  useEffect(() => {
    const handleMusicPlay = (event: CustomEvent) => {
      // We got a play event from another component
      console.log("Music play event received", event.detail);
      
      // If we're currently loading, don't respond immediately
      if (isLoadingRef.current) {
        pendingPlayRequestRef.current = true;
        return;
      }
      
      // If it's the same song that's currently playing and toggling is requested
      if (player.activeId === event.detail.id && event.detail.toggle) {
        // Toggle play/pause state
        setIsPlaying(prevState => {
          const newPlayState = !prevState;
          
          // Handle the audio element update based on new state
          if (!newPlayState) {
            // If we're pausing
            if (audioRef.current) {
              audioRef.current.pause();
            }
          } else {
            // If we're playing
            if (audioRef.current && songData && !isLoadingRef.current) {
              // Use a timeout to prevent race conditions
              setTimeout(() => {
                if (audioRef.current) {
                  // Don't reset the current time when toggling the same song
                  const playPromise = audioRef.current.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(error => {
                      console.error("Error playing audio:", error);
                      pendingPlayRequestRef.current = true;
                    });
                  }
                }
              }, 50);
            }
          }
          
          return newPlayState;
        });
      } else if (player.activeId === event.detail.id && !event.detail.toggle) {
        // Always play when toggle is false (like with Play All button)
        setIsPlaying(true);
      } else {
        // It's a different song, so start playing it
        setIsPlaying(true);
      }
    };
    
    document.addEventListener('musicPlay', handleMusicPlay as EventListener);
    
    return () => {
      document.removeEventListener('musicPlay', handleMusicPlay as EventListener);
    };
  }, [player.activeId, songData]);

  const handlePlay = () => {
    if (!player.activeId || isLoadingRef.current) {
      return;
    }

    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      // Only update time - this shouldn't trigger any reloads
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      
      // Update state to match (but don't depend on this in useEffect)
      setCurrentTime(newTime);
    }
  };

  // Format time helper function
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylist = () => {
    if (player.activeId) {
      setAddToPlaylistOpen(true);
    }
  };

  // Reset player if song is playing but src is empty (can happen after refresh)
  useEffect(() => {
    if (isPlaying && audioRef.current && !audioRef.current.src && songData && songData.musicFile) {
      audioRef.current.src = songData.musicFile;
      audioRef.current.play().catch(error => {
        console.error("Error playing audio after reset:", error);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, songData]);


  return (
    <>
      <div className="h-20 bg-[#181818] border-t border-[#333] px-4 flex items-center text-white">
        <div className="flex items-center w-1/3">
          {songData ? (
            <>
              <div className="h-14 w-14 relative mr-3">
                <Image
                  src={songData.musicPoster || "https://via.placeholder.com/60"}
                  alt={songData.title || "Song"}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div>
                <p className="text-sm font-medium truncate">{songData.title || "Unknown title"}</p>
                <p className="text-xs text-gray-400 truncate">{songData.artist?.fullname || "Unknown artist"}</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-14 w-14 relative mr-3">
                <Image
                  src="https://via.placeholder.com/60"
                  alt="No song playing"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div>
                <p className="text-sm font-medium truncate">No music playing</p>
                <p className="text-xs text-gray-400 truncate">Select a song to play</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-4 mb-2">
            <button className="text-gray-400 hover:text-white">
              <Shuffle className="h-4 w-4" />
            </button>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onPlayPrevious}
              disabled={isLoading || isLoadingRef.current}
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className={`${
                isPlaying ? 'bg-white text-black' : 'bg-white text-black'
              } rounded-full p-2 hover:scale-105 transition ${isLoading || isLoadingRef.current ? 'opacity-50' : ''}`}
              onClick={handlePlay}
              disabled={isLoading || isLoadingRef.current}
            >
              {isLoading || isLoadingRef.current ? (
                <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
              ) : (
                <Icon className="h-4 w-4 fill-current" />
              )}
            </button>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onPlayNext}
              disabled={isLoading || isLoadingRef.current}
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <div className="w-full max-w-md flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="w-1/3 flex justify-end items-center">
          <div className="flex items-center gap-2">
            <div title="Add to playlist">
              <ListPlus 
                className="h-5 w-5 text-gray-400 cursor-pointer mr-4 hover:text-white transition" 
                onClick={handleAddToPlaylist}
              />
            </div>
            <VolumeIcon 
              className="h-4 w-4 text-gray-400 cursor-pointer" 
              onClick={toggleMute}
            />
            <Slider
              value={[volume]}
              onValueChange={(value: number[]) => setVolume(value[0])}
              max={1}
              step={0.1}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <AddToPlaylistDialog
        open={addToPlaylistOpen}
        onOpenChange={setAddToPlaylistOpen}
        musicId={player.activeId || ""}
      />
    </>
  );
};

export default MusicPlayer; 