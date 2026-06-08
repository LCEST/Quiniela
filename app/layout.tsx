import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/providers/QueryProvider";
import { AppVersionChecker } from "@/components/AppVersionChecker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiniela Mundial 2026",
  description: "Predice los resultados del Mundial 2026 y compite con tus amigos",
  manifest: "/manifest.json?v=3",
  icons: {
    icon: "/icons/icon-192x192.png?v=3",
    apple: "/icons/icon-192x192.png?v=3",
  },
  other: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
      signInFallbackRedirectUrl="/home"
      signUpFallbackRedirectUrl="/home"
    >
      <html lang="es" className="dark">
        <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
          <AppVersionChecker />
          <QueryProvider>
            <div className="flex-1">
              {children}
            </div>
          </QueryProvider>
          <footer className="sticky bottom-16 z-[60] px-4 py-4 text-center border-t border-white/20 bg-background">
            <p className="text-white/60 text-xs font-medium">
              Built by Luis Esturbán · Next.js · Clerk · Supabase · Tailwind CSS
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
