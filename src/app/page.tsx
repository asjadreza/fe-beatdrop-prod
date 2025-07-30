"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music, PlayCircle, ListMusic } from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If user is authenticated, redirect to main page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/main");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white min-h-screen">
      {/* Hero Section */}
      <div className="pt-20 pb-16 md:pt-32 md:pb-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your music,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
                everywhere.
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              BeatDrop is the ultimate platform for music lovers. Upload, stream, and share your favorite tunes with friends and followers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-6 rounded-full h-auto"
              >
                <Link href="/auth/register">
                  Sign up for free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-6 rounded-full h-auto"
              >
                <Link href="/auth/login">
                  Already have an account? Sign in
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Music experience"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why choose BeatDrop?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1d1d1d] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600/20 text-green-500 mb-5">
                <Music className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your Music</h3>
              <p className="text-gray-400">Share your original tracks with the world. Easy uploading and management.</p>
            </div>
            
            <div className="bg-[#1d1d1d] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 mb-5">
                <PlayCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Stream Anywhere</h3>
              <p className="text-gray-400">Listen to your favorite music anywhere, anytime with our premium streaming quality.</p>
            </div>
            
            <div className="bg-[#1d1d1d] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-600/20 text-purple-500 mb-5">
                <ListMusic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Playlists</h3>
              <p className="text-gray-400">Organize your music with custom playlists. Discover new sounds based on your taste.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-[#333]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">BeatDrop</h2>
            <p className="text-gray-400 mt-2">Your music, your way.</p>
          </div>
          
          <div className="flex gap-8">
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[#333] text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} BeatDrop. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
