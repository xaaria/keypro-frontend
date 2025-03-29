"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthContextProvider from "@/AuthContextProvider";
import Nav from "./components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin=""/>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AuthContextProvider>
              <Nav />
            </AuthContextProvider>
            <div style={{ padding: '2em' }}>
              <AuthContextProvider>
                {children}
              </AuthContextProvider>
            </div>
          </div>
      </body>
    </html>
  );
}
