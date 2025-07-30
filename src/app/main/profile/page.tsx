"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/store/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Music, ListMusic } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="bg-[#1E1E1E] border-[#333] text-white">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#333] mb-4">
                <Image
                  src={user.userProfilePic || "https://via.placeholder.com/150"}
                  alt={`${user.username}'s profile picture`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <h2 className="text-2xl font-bold">{user.fullname}</h2>
              <p className="text-gray-400">@{user.username}</p>

              <div className="flex items-center text-gray-400 text-sm mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Joined {joinDate}</span>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="mt-6 w-full border-red-500 text-red-500 hover:bg-red-500/10"
                disabled={isLoading}
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#1E1E1E] border-[#333] text-white">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription className="text-gray-400">
                Your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Full Name</p>
                  <p className="font-medium">{user.fullname}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="font-medium">@{user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E1E] border-[#333] text-white">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Your BeatDrop activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Music className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Uploaded Tracks</p>
                  <p className="font-medium">0 tracks</p>
                </div>
              </div>

              <div className="flex items-center">
                <ListMusic className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Playlists</p>
                  <p className="font-medium">0 playlists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 