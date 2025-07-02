
import type { Metadata } from "next";
import "./globals.css";
import Root from "./root";
import InformationState from "./context/informationContext/informationState";
import UserState from "./context/userContext/userState";


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
