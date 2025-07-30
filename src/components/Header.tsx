"use client"

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, LogOut, Music, PlusCircle , X} from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMainPage = pathname?.startsWith('/main');
  const titleRef = useRef<HTMLInputElement>(null);
  const musicFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // const handleUploadMusic = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!titleRef.current?.value || !musicFileRef.current?.files?.[0]) {
  //     toast({ title: 'Missing fields', description: 'Title and music file are required', variant: 'destructive' });
  //     return;
  //   }
    
  //   // Check file sizes
  //   const musicFile = musicFileRef.current.files[0];
  //   const posterFile = posterFileRef.current?.files?.[0];
    
  //   // Music file size check (10MB = 10 * 1024 * 1024 bytes)
  //   if (musicFile.size > 10 * 1024 * 1024) {
  //     toast({ title: 'File too large', description: 'Music file must be less than 10MB', variant: 'destructive' });
  //     return;
  //   }
    
  //   // Poster file size check (2MB = 2 * 1024 * 1024 bytes)
  //   if (posterFile && posterFile.size > 2 * 1024 * 1024) {
  //     toast({ title: 'File too large', description: 'Poster image must be less than 2MB', variant: 'destructive' });
  //     return;
  //   }
    
  //   setUploading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append('title', titleRef.current.value);
  //     formData.append('musicFile', musicFile);
  //     if (posterFile) {
  //       formData.append('musicPoster', posterFile);
  //     }
  //     const token = localStorage.getItem('token');
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music`, {
  //       method: 'POST',
  //       headers: { Authorization: `Bearer ${token}` },
  //       body: formData,
  //     });
  //     if (!res.ok) {
  //       const err = await res.json();
  //       throw new Error(err.message || 'Failed to upload');
  //     }
  //     toast({ title: 'Success', description: 'Music uploaded successfully!' });
  //     setShowUploadModal(false);
  //     router.push('/main');
  //   } catch (err: any) {
  //     toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleUploadMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleRef.current?.value || !musicFileRef.current?.files?.[0]) {
      toast({ title: 'Missing fields', description: 'Title and music file are required', variant: 'destructive' });
      return;
    }
    
    // Check file sizes
    const musicFile = musicFileRef.current.files[0];
    const posterFile = posterFileRef.current?.files?.[0];
    
    // Music file size check (10MB = 10 * 1024 * 1024 bytes)
    if (musicFile.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Music file must be less than 10MB', variant: 'destructive' });
      return;
    }
    
    // Poster file size check (2MB = 2 * 1024 * 1024 bytes)
    if (posterFile && posterFile.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Poster image must be less than 2MB', variant: 'destructive' });
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', titleRef.current.value);
      formData.append('musicFile', musicFile);
      if (posterFile) {
        formData.append('musicPoster', posterFile);
      }
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to upload');
      }
      toast({ title: 'Success', description: 'Music uploaded successfully!' });
      setShowUploadModal(false);
      router.push('/main');
    } catch (err: unknown) {
      let errorMessage = 'Upload failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      toast({ title: 'Upload failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  
  return (
    <header className="h-16 bg-[#121212] flex items-center justify-between px-6 border-b border-[#333]">
      <div className="flex items-center">
        <div className="mr-8">
          <Link href="/" className="text-2xl font-bold text-white">
            Beatdrop
          </Link>
        </div>
      </div>
      
      {isMainPage && (
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for songs, artists, albums..."
              className="bg-[#2a2a2a] text-white rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center">
        {isAuthenticated && user ? (
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="User menu"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden relative border border-[#333]">
                <Image 
                  src={user.userProfilePic || "https://via.placeholder.com/150"} 
                  alt={`${user.username}'s profile`}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <span className="hidden md:inline text-sm font-medium text-white">
                {user.username}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 py-1 bg-[#1E1E1E] rounded-md shadow-lg z-50 border border-[#333]">
                <Link 
                  href="/main/profile" 
                  className="px-4 py-2 text-sm text-white hover:bg-[#333] flex items-center"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Your Profile
                </Link>
                <Link 
                  href="/main/music" 
                  className=" px-4 py-2 text-sm text-white hover:bg-[#333] flex items-center"
                  onClick={() => setShowDropdown(false)}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Your Music
                </Link>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333] flex items-center"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload Music
                </button>
                <button 
                  onClick={handleLogout}
                  className=" w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333] flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login"
              className="text-sm font-medium text-white hover:text-gray-300"
            >
              Sign in
            </Link>
            <Link 
              href="/auth/register"
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-green-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
          <div className="bg-[#181818] rounded-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowUploadModal(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-white">Upload Music</h2>
            <form onSubmit={handleUploadMusic} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input 
                  id="title" 
                  ref={titleRef} 
                  className="mt-1 bg-[#2a2a2a] text-white focus-visible:ring-0 focus-visible:ring-offset-0" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="musicFile" className="text-white">Music File</Label>
                <Input 
                  id="musicFile" 
                  type="file" 
                  accept="audio/*" 
                  ref={musicFileRef} 
                  className="mt-1 bg-[#2a2a2a] text-white focus-visible:ring-0 focus-visible:ring-offset-0" 
                  required 
                />
                <p className="text-xs text-gray-400 mt-1">File size must be less than 10MB</p>
              </div>
              <div>
                <Label htmlFor="musicPoster" className="text-white">Poster (optional)</Label>
                <Input 
                  id="musicPoster" 
                  type="file" 
                  accept="image/*" 
                  ref={posterFileRef} 
                  className="mt-1 bg-[#2a2a2a] text-white focus-visible:ring-0 focus-visible:ring-offset-0" 
                />
                <p className="text-xs text-gray-400 mt-1">File size must be less than 2MB</p>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 