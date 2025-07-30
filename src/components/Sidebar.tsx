"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Library, PlusCircle, ListMusic, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { getMyPlaylists, createPlaylist, Playlist } from '@/lib/api/playlist';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const Sidebar = () => {
  const pathname = usePathname();
  const { token, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/main' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Library', icon: Library, path: '/library' }
  ];

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    if (!token || !isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const userPlaylists = await getMyPlaylists(token);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your playlists',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new playlist
  const handleCreatePlaylist = async () => {
    if (!token || !newPlaylist.title.trim()) return;
    
    try {
      setIsCreating(true);
      const createdPlaylist = await createPlaylist(
        {
          title: newPlaylist.title,
          description: newPlaylist.description
        },
        token
      );
      
      setPlaylists([createdPlaylist, ...playlists]);
      setNewPlaylist({ title: '', description: '' });
      toast({
        title: 'Success',
        description: 'Playlist created successfully',
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to create playlist',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Fetch playlists on mount and when auth state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPlaylists();
  }, [token, isAuthenticated]);

  return (
    <div className="w-64 bg-[#121212] text-white border-r border-[#333] overflow-y-auto flex-shrink-0">
      <div className="p-5">
        <div className="space-y-1 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.name}
                href={item.path}
                className={`flex items-center py-2 px-4 rounded-md transition ${
                  isActive ? 'bg-[#333] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="pt-4 pb-2 border-t border-[#333]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-gray-400">PLAYLISTS</h3>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-1 text-gray-400 hover:text-white" disabled={!isAuthenticated}>
                  <PlusCircle className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#1E1E1E] border-[#333] text-white">
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="playlist-name">Playlist Name</Label>
                    <Input 
                      id="playlist-name" 
                      placeholder="My Awesome Playlist" 
                      className="bg-[#333] border-[#555] text-white"
                      value={newPlaylist.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlaylist({...newPlaylist, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="playlist-description">Description (optional)</Label>
                    <Textarea 
                      id="playlist-description" 
                      placeholder="Enter description..." 
                      className="bg-[#333] border-[#555] text-white h-24 resize-none"
                      value={newPlaylist.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-[#555] text-white hover:bg-[#444]">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button 
                        onClick={handleCreatePlaylist} 
                        disabled={!newPlaylist.title.trim() || isCreating}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Playlist'
                        )}
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <Link 
                  key={playlist.id}
                  href={`/playlist/${playlist.id}`}
                  className={`flex items-center py-2 px-4 rounded-md transition ${
                    pathname === `/playlist/${playlist.id}` ? 'bg-[#333] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ListMusic className="h-4 w-4 mr-3" />
                  <span className="text-sm truncate">{playlist.title}</span>
                  {playlist._count && (
                    <span className="text-xs text-gray-500 ml-auto">{playlist._count.music}</span>
                  )}
                </Link>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                {isAuthenticated 
                  ? "No playlists found. Create one!" 
                  : "Login to create playlists"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 