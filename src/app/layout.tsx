import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noticias Hoy | Portal de Noticias Digital",
  description: "Tu portal de noticias digital de confianza. Las últimas noticias de tecnología, deportes, política, ciencia, cultura y economía.",
  keywords: ["noticias", "actualidad", "tecnología", "deportes", "política", "ciencia", "cultura", "economía"],
  authors: [{ name: "Noticias Hoy" }],
  icons: {
    icon: "https://api.dicebear.com/9.x/initials/svg?seed=NH&backgroundColor=c0392b",
  },
  openGraph: {
    title: "Noticias Hoy - Portal de Noticias Digital",
    description: "Las últimas noticias de tecnología, deportes, política, ciencia, cultura y economía.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SonnerToaster />
          <ShadcnToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
