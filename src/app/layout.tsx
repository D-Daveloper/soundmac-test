
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InformationState from "./context/informationState";
import Root from "./root";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOUNDMAC",
  description: "the best!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <InformationState>
        <body className={`${geistSans.variable} ${geistMono.variable} parentBody`}>
          <Root>{children}</Root>
        </body>
      </InformationState>
    </html>
  );
}
