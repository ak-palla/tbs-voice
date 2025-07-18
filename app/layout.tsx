import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "./global-overrides.css";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { initializeSupabaseStorage } from "@/utils/supabase/storage-init";
import { Toaster as SonnerToaster } from "sonner";
import GoogleAnalyticsScript from "@/components/google-analytics-script";
// import { FloatingChat } from "@/components/floating-chat";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Trade Business Growth: Scale Your Success Today",
  description: "Master Trade Business Growth: Unlock Success TodayTransform your trade business with strategies &amp; support from Trade Business School. Scale your operations &amp; boost profits. Watch our FREE intro video now!",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Initialize Supabase storage buckets (silently handle failures)
  await initializeSupabaseStorage().catch(() => {
    // Storage initialization failed - this is handled gracefully
    // The app will still work, but file uploads to machines bucket may fail
  });

  // If user is authenticated and tries to access root, redirect to dashboard
  if (session && typeof window !== 'undefined' && window.location.pathname === '/') {
    redirect('/dashboard');
  }

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <head>
        <GoogleAnalyticsScript />
      </head>
      <body className="bg-background text-foreground">
    
          <main className="min-h-screen flex flex-col items-center">
            <div className="w-full">
              <div id="page-content" className="min-h-screen flex justify-center items-center w-full transition-[padding] duration-300 ease-in-out bg-white">
                {children}
              </div>
            </div>
          </main>
          <Toaster />
          <SonnerToaster position="top-right" />
          
      </body>
    </html>
  );
}
