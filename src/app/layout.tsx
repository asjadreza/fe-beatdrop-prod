import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/store/auth-context";
import ClientLayout from "@/components/layout/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeatDrop - Music Streaming Platform",
  description: "Listen to your favorite music and create playlists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
