import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "~*~ DitherY2K ~*~ The BEST dithering tool!! ~*~",
  description:
    "The ULTIMATE retro image dithering tool!!! Upload your photos and apply sick dithering effects like it's 1999!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' fill='%23000080'/><rect x='2' y='2' width='4' height='4' fill='%23FF00FF'/><rect x='6' y='2' width='4' height='4' fill='%2300FFFF'/><rect x='10' y='2' width='4' height='4' fill='%23FFFF00'/><rect x='2' y='6' width='4' height='4' fill='%2300FF00'/><rect x='6' y='6' width='4' height='4' fill='%23FF6600'/><rect x='10' y='6' width='4' height='4' fill='%23FF0000'/><rect x='2' y='10' width='4' height='4' fill='%23FFFF00'/><rect x='6' y='10' width='4' height='4' fill='%23FF00FF'/><rect x='10' y='10' width='4' height='4' fill='%2300FFFF'/></svg>",
  },
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
