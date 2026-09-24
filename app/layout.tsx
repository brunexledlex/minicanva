import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "minicanva",
  description: "Stories e carrosséis de Instagram em formato de revista",
};

// Fonts used inside the Konva pages (see lib/themes.ts). They come from Google Fonts
// because the canvas draws with the browser's font faces, which next/font would rename.
const PAGE_FONTS =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Inter:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Source+Serif+4:ital,wght@0,400;0,700;1,400;1,700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap";
const ICONS = "https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&display=block";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={PAGE_FONTS} />
        <link rel="stylesheet" href={ICONS} />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
