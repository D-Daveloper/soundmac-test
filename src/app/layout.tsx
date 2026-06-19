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
  variable: "--font-figtree", 
});

// export const metadata: Metadata = {
//   title: "SOUNDMAC",
//   description: "the best!",
//   icons: {
//     icon: "/logo.svg",
//   },
// };

export const metadata: Metadata = {
  title: "SoundMac | Music Distribution for Independent Artists",
  description:
    "Distribute your music to Spotify, Apple Music, Boomplay, Audiomack, TikTok and more with SoundMac. Built for independent African artists and labels. Fast, reliable, and transparent.",
  
    keywords: [
    "music distribution",
    "Digital Music distribution",
    "independent artists",
    "Spotify distribution",
    "Apple Music distribution",
    "Boomplay",
    "Audiomack",
    "African music distribution",
    "Nigerian music distribution",
    "upload music online",
    "music distribution Africa",
  ],
  authors: [{ name: "SoundMac Music Distribution LTD", url: "https://www.soundmac.co" }],
  robots: {
    index: true,
    follow: true,
  },
  // Canonical URL — prevents duplicate content penalties
  alternates: {
    canonical: "https://www.soundmac.co/",
  },
  // ── Icons ──────────────────────────────────────────────────
  icons: {
    icon: "/logo.svg",
    apple: "/logo192.png", // apple touch icon for iOS home screen
  },
  // ── Open Graph (Facebook, WhatsApp, LinkedIn previews) ─────
  openGraph: {
    type: "website",
    siteName: "SoundMac",
    title: "SoundMac | Music Distribution for Independent Artists",
    description:
      "Distribute your music to Spotify, Apple Music, Boomplay, Audiomack, TikTok and more with SoundMac. Built for independent African artists and labels.",
    url: "https://www.soundmac.co/",
    locale: "en_US",
    images: [
      {
        // Create a 1200x630px banner with your logo + tagline
        // and place it in your /public folder
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "SoundMac — Music Distribution for Independent Artists and Labels",
      },
    ],
  },
  // ── Twitter / X Card ───────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "SoundMac | Music Distribution for Independent Artists",
    description:
      "Distribute your music to Spotify, Apple Music, Boomplay, Audiomack, TikTok and more with SoundMac.",
    images: ["https://www.soundmac.co/og-image.jpg"],
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

          <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '699360212731810');
              fbq('track', 'PageView');
            `,
          }}
        />

         <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=699360212731810&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

           <Script
          id="twitter-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
              },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
              a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
              twq('config','q104j');
            `,
          }}
        />
  {/* ── Google Analytics (gtag.js) ──────────────────────────
            strategy="afterInteractive" loads after page is ready
            so it never blocks your page render / Core Web Vitals.
        ──────────────────────────────────────────────────────── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H85K9DWN71"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-H85K9DWN71');
            `,
          }}
        />

           {/* ── CookieYes (GDPR Cookie Consent Banner) ─────────────
            strategy="beforeInteractive" so the banner appears
            before any tracking scripts fire — required for GDPR.
        ──────────────────────────────────────────────────────── */}
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/3f915e3c7abb8e5c76f3e0df6c531d9f/script.js"
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
