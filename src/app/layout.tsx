import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DitherY2K - Retro Dithering Tool",
  description:
    "The ULTIMATE retro image dithering tool!!! Upload your photos and apply sick dithering effects like it's 1999!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
