import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KERA - Be There, From Here",
  description: "Connect with professional carers for your family back home.",
  applicationName: "KERA",
  manifest: "/manifest.webmanifest",
  themeColor: "#004225",
  appleWebApp: {
    capable: true,
    title: "KERA",
    statusBarStyle: "default",
  },
};

import AuthContext from '../components/auth-context';
import { LanguageProvider } from '../components/LanguageContext';
import QueryProvider from '../components/QueryProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContext>
          <QueryProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </QueryProvider>
        </AuthContext>
      </body>
    </html>
  );
}
