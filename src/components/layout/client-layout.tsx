"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MusicPlayer from "@/components/MusicPlayer";
import ProtectedRoute from "@/components/auth/protected-route";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isRootPage = pathname === "/";
  const shouldShowLayout = !isAuthPage && !isRootPage;
  const isProtectedRoute = pathname?.startsWith("/main");

  // Wrap with ProtectedRoute only for paths that need authentication
  const content = isProtectedRoute ? (
    <ProtectedRoute>{children}</ProtectedRoute>
  ) : (
    children
  );

  return shouldShowLayout ? (
    <div className="flex flex-col h-screen bg-[#121212]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4 px-6 text-white">
          {content}
        </main>
      </div>
      <MusicPlayer />
    </div>
  ) : (
    <>{content}</>
  );
} 