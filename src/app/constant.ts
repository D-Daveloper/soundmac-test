import { useTabQuery } from "@/util/customHooks/useTabQuery";

export const SERVER = process.env.NEXT_PUBLIC_APP_URL;
export const AYNCardItems = [
  {
    title: "Global Distribution",
    subTitle:
      "Reach fans worldwide with distribution to Spotify, Apple Music, Amazon, TikTok, and 200+ other platforms in just a few clicks.",
  },
  {
    title: "Keep 100% of Your Royalties",
    subTitle:
      "Reach fans worldwide with distribution to Spotify, Apple Music, Amazon, TikTok, and 200+ other platforms in just a few clicks.",
  },
  {
    title: "Smart Analytics",
    subTitle:
      "Track your streams, monitor audience growth, and discover where your fans are with beautiful, intuitive analytics.",
  },
  {
    title: "Release Planning",
    subTitle:
      "Schedule releases in advance, create pre-saves, and coordinate your marketing for maximum impact.",
  },
  {
    title: "Artist Investment Program",
    subTitle:
      "Get funding to grow your career! Eligible artists can apply for SoundMac's investment program, where we provide financial support.",
  },
  {
    title: "Reach Boost",
    subTitle:
      "Get your music heard with SoundMac’s promotional tools. Submit to official playlists, pitch to influencers and many more.",
  },
];

export const categories = [
  "Success Stories",
  "Artist Resources",
  "Industry Insights",
  "Music Marketing",
];
export const blogContent = [
    {
        "id": 1,
        "title": "Building A Strong Personal Brand as an Independent Artist",
        "content": "Personal Branding is the deliberate or indeliberate things you that you do that gives the world a perception of you. It is basically what defines you as a person, and in this case, as an artist.",
        "slug": "building-a-strong-personal-brand-as-an-independent-artist"
    },
    {
        "id": 2,
        "title": "The Importance of Music Distribution for Independent Artists",
        "content": "Music distribution is the process of getting your music into the hands of listeners. For independent artists, it is crucial to have a reliable distribution strategy to ensure that your music reaches a wide audience.",
        "slug": "the-importance-of-music-distribution-for-independent-artists"
    },
    {
        "id": 3,
        "title": "How to Promote Your Music Effectively",
        "content": "Promoting your music is essential for gaining visibility and building a fanbase. This article explores various strategies for effectively promoting your music, including social media marketing, collaborations, and live performances.",
        "slug": "how-to-promote-your-music-effectively"
    },
    {
        "id": 4,
        "title": "Understanding Music Royalties",
        "content": "Music royalties are payments made to artists and songwriters for the use of their music. This article explains the different types of royalties, how they are calculated, and why they are important for independent artists.",
        "slug": "understanding-music-royalties"
    },
    {
        "id": 5,
        "title": "The Role of Social Media in Music Promotion",
        "content": "Social media has become a powerful tool for music promotion. This article discusses how independent artists can leverage social media platforms to connect with fans, share their music, and grow their audience.",
        "slug": "the-role-of-social-media-in-music-promotion"
    },
    {
        "id": 6,
        "title": "Navigating the Music Industry as an Independent Artist",
        "content": "The music industry can be challenging for independent artists. This article provides insights into navigating the industry, including building a network, understanding contracts, and finding opportunities for growth.",
        "slug": "navigating-the-music-industry-as-an-independent-artist"
    },
    {
        "id": 7,
        "title": "The Future of Music Distribution",
        "content": "The music distribution landscape is constantly evolving. This article explores the future of music distribution, including emerging technologies, changes in consumer behavior, and the impact of streaming services.",
        "slug": "the-future-of-music-distribution"
    },
    {
        "id": 8,
        "title": "Tips for Independent Artists to Succeed",
        "content": "Success as an independent artist requires dedication, creativity, and strategic planning. This article offers practical tips for independent artists to succeed in the competitive music industry.",
        "slug": "tips-for-independent-artists-to-succeed"
    }
];

export const promotionContent = [
  {
    id: 1,
    title: "Boomplay Editorial playlist",
    content:
      "Get featured on Boomplay’s top editorial playlists and amplify your reach to millions of music fans across Africa.",
    image:
      "https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/WhatsApp%20Image%202025-01-17%20at%2019.15.06_bab69026.jpg",
      category: "Boomplay",
  },
  {
    id: 2,
    title: "Deezer Chart Promotion",
    content:
      "GBoost your visibility with targeted promotion on Deezer charts, connecting your music to a global audience.",
    image:
      "https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/WhatsApp%20Image%202025-01-17%20at%2018.51.30_67df6974.jpg",
    category: "Deezer",
  },
  {
    id: 3,
    title: "Shazam Nigeria Chart Promotion",
    content:
      "Secure a spot on Shazam Nigeria’s trending charts and make your music discoverable to fans across the nation",
    image:
      "https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/WhatsApp%20Image%202025-01-17%20at%2019.11.41_97bde6b8.jpg",
    category: "Shazam",
  },
  {
    id: 4,
    title: "Nigeria Radio Promotion (30 Days Airplay)",
    content:
      "Achieve nationwide recognition with 30 days of consistent airplay on Nigeria’s leading radio stations.",
    image:
      "https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/WhatsApp%20Image%202025-01-18%20at%2022.42.05_eaf5b148.jpg",
    category: "Radio-Promotion",
  },
  {
    id: 5,
    title: "Playlist Pitch",
    content:
      "Pitch your release to top Dsps. Increase your reach, grow your fanbase, and let your sound stand out!.",
    image:
      "https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/WhatsApp Image 2025-04-05 at 15.29.33_eccf3648.jpg",
    category: "Playlist-Pitch",
  },
  {
    id: 6,
    title: "Online Press (Newspaper Article Publication)",
    content:
      "Increase your credibility and reach with strategic features in top online newspapers, connecting your music to a broader audience.",
    image:
      "https://soundmac1.s3.eu-north-1.amazonaws.com/blogImage/WhatsApp%20Image%202025-01-18%20at%2022.42.06_65029b80.jpg",
    category: "Online-Press",
  },
];
