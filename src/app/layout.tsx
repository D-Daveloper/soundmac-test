import { Figtree } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Root from "./root";
import Script from "next/script";
import InformationState from "./context/informationContext/informationState";
import UserState from "./context/userContext/userState";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import "../../node_modules/flag-icons/css/flag-icons.min.css";
import { faqSchema } from "@/seo/faqSchema";
import { organizationSchema } from "@/seo/organizationSchema";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-figtree", // optional: use CSS variable
});

export const metadata: Metadata = {
  title: "SOUNDMAC",
  description: "the best!",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`parentBody antialiased`}>
        <Script
          id="faqSchema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          strategy="beforeInteractive"
        />

        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
          strategy="beforeInteractive"
        />
        <ReactQueryProvider>
          <InformationState>
            <UserState>
              {/* <DashboardState> */}
              <Root>{children}</Root>
              {/* </DashboardState> */}
            </UserState>
          </InformationState>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
