export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SoundMac Music Distribution LTD.",
  url: "https://soundmac.co",
  logo: "https://soundmac.co/logo.png",
  description: "SoundMac is a digital music distribution platform helping independent African artists and labels distribute music to Spotify, Apple Music, Boomplay, Audiomack, and 200+ stores worldwide.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+15558244080",
    contactType: "Customer Support",
    email: "support@soundmac.co",
  },
  sameAs: [
    "https://instagram.com/soundmac.co",
    "https://twitter.com/soundmac_co",
    "https://youtube.com/@soundmac",
    "https://tiktok.com/@soundmac.co",  
    "https://linkedin.com/company/soundmac",
    "https://facebook.com/soundmac",
  ],
};