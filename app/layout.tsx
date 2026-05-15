import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/lib/theme-context";
import AssistantWidget from "@/components/AssistantWidget";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI CourseCrafter - Personalized AI-Powered Learning",
  description:
    "Master any skill with AI-generated courses. Personalized learning paths, adaptive curriculum, and expert mentorship tailored to your goals.",
  keywords: [
    "AI Learning",
    "Online Courses",
    "Personalized Education",
    "Skill Development",
    "Tech Education",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <SessionProvider session={session}>
            {children}
            <AssistantWidget />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
