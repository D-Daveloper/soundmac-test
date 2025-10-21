import { Figtree } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Root from "./root";
import InformationState from "./context/informationContext/informationState";
import UserState from "./context/userContext/userState";


const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // choose weights you need
  variable: "--font-figtree", // optional: use CSS variable
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
        <UserState>
          <body className={`parentBody`}>
            <Root>{children}</Root>
          </body>
        </UserState>
      </InformationState>
    </html>
  );
}
