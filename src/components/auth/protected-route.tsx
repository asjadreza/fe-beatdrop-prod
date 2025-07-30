"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and not authenticated and trying to access a protected route
    if (!isLoading && !isAuthenticated && pathname.startsWith("/main")) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading or protected content
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  // Pass through the children (protected content) if authenticated
  return <>{children}</>;
} 