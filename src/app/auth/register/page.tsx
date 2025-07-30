"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      fullname: "",
      password: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    if (!profilePic) {
      setError("Please upload a profile picture");
      return;
    }

    try {
      await register({
        ...data,
        userProfilePic: profilePic,
      });
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">BeatDrop</h1>
          <h2 className="mt-6 text-3xl font-bold text-white">Sign up</h2>
          <p className="mt-2 text-sm text-gray-400">
            to start your music journey
          </p>
        </div>

        <div className="mt-8 bg-[#1E1E1E] px-6 py-8 rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div 
                  className="relative w-24 h-24 mb-4 rounded-full overflow-hidden bg-[#2A2A2A] cursor-pointer border-2 border-dashed border-gray-500 hover:border-gray-400 flex items-center justify-center"
                  onClick={triggerFileInput}
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-sm text-gray-400">Profile Picture</p>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className="bg-[#2A2A2A] text-white border-[#3A3A3A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Choose a username"
                        className="bg-[#2A2A2A] text-white border-[#3A3A3A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="bg-[#2A2A2A] text-white border-[#3A3A3A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        className="bg-[#2A2A2A] text-white border-[#3A3A3A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-red-500 mt-2 text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link
              href="/auth/login"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 