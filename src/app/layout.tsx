import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { db } from "@/lib/db";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let settingsMap: Record<string, string> = {};
  try {
    const settings = await db.siteSettings.findMany();
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);
  }

  let siteName = settingsMap["site_name"] || "Tolima Informa";
  siteName = siteName.replace(/Colombia\s+en\s+Debate/gi, "Tolima Informa");

  let siteDesc = settingsMap["site_description"] || "Tu portal de noticias digital de confianza. Las últimas noticias de Tolima, actualidad, tecnología, deportes, política, ciencia, cultura y economía.";
  siteDesc = siteDesc.replace(/Colombia\s+en\s+Debate/gi, "Tolima Informa");

  let seoTitle = settingsMap["seo_title"] || `${siteName} | Portal de Noticias Digital`;
  seoTitle = seoTitle.replace(/Colombia\s+en\s+Debate/gi, "Tolima Informa");

  const siteFavicon = settingsMap["site_favicon"] || "https://api.dicebear.com/9.x/initials/svg?seed=TI&backgroundColor=c0392b";

  return {
    title: seoTitle,
    description: siteDesc,
    keywords: ["noticias", "actualidad", "tecnología", "deportes", "política", "ciencia", "cultura", "economía"],
    authors: [{ name: siteName }],
    icons: {
      icon: siteFavicon,
    },
    openGraph: {
      title: siteName,
      description: siteDesc,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
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
