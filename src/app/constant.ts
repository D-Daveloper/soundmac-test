import { IArtist } from "@/util/models/artistModel";
import { Artist, CreateArtistForm } from "./type";

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
    id: 1,
    title: "Building A Strong Personal Brand as an Independent Artist",
    content:
      "Personal Branding is the deliberate or indeliberate things you that you do that gives the world a perception of you. It is basically what defines you as a person, and in this case, as an artist.",
    slug: "building-a-strong-personal-brand-as-an-independent-artist",
  },
  {
    id: 2,
    title: "The Importance of Music Distribution for Independent Artists",
    content:
      "Music distribution is the process of getting your music into the hands of listeners. For independent artists, it is crucial to have a reliable distribution strategy to ensure that your music reaches a wide audience.",
    slug: "the-importance-of-music-distribution-for-independent-artists",
  },
  {
    id: 3,
    title: "How to Promote Your Music Effectively",
    content:
      "Promoting your music is essential for gaining visibility and building a fanbase. This article explores various strategies for effectively promoting your music, including social media marketing, collaborations, and live performances.",
    slug: "how-to-promote-your-music-effectively",
  },
  {
    id: 4,
    title: "Understanding Music Royalties",
    content:
      "Music royalties are payments made to artists and songwriters for the use of their music. This article explains the different types of royalties, how they are calculated, and why they are important for independent artists.",
    slug: "understanding-music-royalties",
  },
  {
    id: 5,
    title: "The Role of Social Media in Music Promotion",
    content:
      "Social media has become a powerful tool for music promotion. This article discusses how independent artists can leverage social media platforms to connect with fans, share their music, and grow their audience.",
    slug: "the-role-of-social-media-in-music-promotion",
  },
  {
    id: 6,
    title: "Navigating the Music Industry as an Independent Artist",
    content:
      "The music industry can be challenging for independent artists. This article provides insights into navigating the industry, including building a network, understanding contracts, and finding opportunities for growth.",
    slug: "navigating-the-music-industry-as-an-independent-artist",
  },
  {
    id: 7,
    title: "The Future of Music Distribution",
    content:
      "The music distribution landscape is constantly evolving. This article explores the future of music distribution, including emerging technologies, changes in consumer behavior, and the impact of streaming services.",
    slug: "the-future-of-music-distribution",
  },
  {
    id: 8,
    title: "Tips for Independent Artists to Succeed",
    content:
      "Success as an independent artist requires dedication, creativity, and strategic planning. This article offers practical tips for independent artists to succeed in the competitive music industry.",
    slug: "tips-for-independent-artists-to-succeed",
  },
];
export const artistContent: Artist[] = [
  {
    artistName: "The Midnight Echoes",
    artistImage: "/signinimage.png",
    appleId: "",
    spotifyId: "",
    updatedAt: new Date("2025-08-28T12:30:35.144+00:00"),
    createdAt: new Date("2025-08-28T12:30:35.144+00:00"),
  },

  {
    artistName: "Kingsley & The Vibe Collective",
    artistImage: "/signinimage.png",
    appleId: "",
    spotifyId: "",
    updatedAt: new Date("2025-08-28T12:30:35.144+00:00"),
    createdAt: new Date("2025-08-28T12:30:35.144+00:00"),
  },

  {
    artistName: "ohn Doe",
    artistImage: "/signinimage.png",
    appleId: "",
    spotifyId: "",
    updatedAt: new Date("2025-08-28T12:30:35.144+00:00"),
    createdAt: new Date("2025-08-28T12:30:35.144+00:00"),
  },
  {
    artistName: "ohn Doe",
    artistImage: "/signinimage.png",
    appleId: "",
    spotifyId: "",
    updatedAt: new Date("2025-08-28T12:30:35.144+00:00"),
    createdAt: new Date("2025-08-28T12:30:35.144+00:00"),
  },
  {
    artistName: "ohn Doe",
    artistImage: "/signinimage.png",
    appleId: "",
    spotifyId: "",
    updatedAt: new Date("2025-08-28T12:30:35.144+00:00"),
    createdAt: new Date("2025-08-28T12:30:35.144+00:00"),
  },
  {
    artistName: "ohn Doe",
    artistImage: "/signinimage.png",
    appleId: "",
    spotifyId: "",
    updatedAt: new Date("2025-08-28T12:30:35.144+00:00"),
    createdAt: new Date("2025-08-28T12:30:35.144+00:00"),
  },
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

export const languagesList = [
  "Afrikaans",
  "Arabic",
  "Bengali",
  "Bulgarian",
  "Cantonese",
  "Catalan",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Haitian",
  "Hausa",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Kazakh",
  "Korean",
  "Lao",
  "Latin",
  "Latvian",
  "Lithuanian",
  "Malay",
  "Norweigian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Sanskrit",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swedish",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukranian",
  "Urdu",
  "Vietnamese",
  "Yoruba",
  "Zulu",
];

export const OTP_EXPIRY_SECONDS = parseInt(
  process.env.NEXT_PUBLIC_OTP_EXPIRY_SECONDS || "300"
);

export const filterOptions = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "A-Z", value: "artistName" },
  { label: "Z-A", value: "-artistName" },
];
export const songFilterOptions = [
  { label: "Newest", value: "-createdAt" },
  { label: "Oldest", value: "createdAt" },
  { label: "A-Z", value: "songTitle" },
  { label: "Z-A", value: "-songTitle" },
];
export const songStatusFilterArray = [
"all","approved","pending","rejected","draft"
];

export const promotionTestData = [
  {
    id: 1,
    category: "Nigeria Radio Promotion",
    packageType: "30 Days Airplay",
    songTitle: "Song Title Here",
    startDate: "2025-08-13T15:06:33.593",
    endDate: "2025-09-12T15:06:33.593",
    status: "In Progress",
    type: "radioPromotion",
    isActive: true,
  },
  {
    id: 1,
    category: "Nigeria Radio Promotion",
    packageType: "30 Days Airplay",
    songTitle: "Song Title Here",
    startDate: "2025-08-13T15:06:33.593",
    endDate: "2025-09-12T15:06:33.593",
    status: "In Progress",
    type: "radioPromotion",
    isActive: true,
  },
  {
    id: 1,
    category: "Nigeria Radio Promotion",
    packageType: "30 Days Airplay",
    songTitle: "Song Title Here",
    startDate: "2025-08-13T15:06:33.593",
    endDate: "2025-09-12T15:06:33.593",
    status: "In Progress",
    type: "radioPromotion",
    isActive: false,
  },
];

const packagesList = [
  [
    "Bronze package (5 B-tier playlist + Push Notifications 2m+ Impressions) | N300,000",
    "Silver package (10 A-tier playlist + Push Notifications 5m+ Impressions) | N500,000",
    "Gold package (15 A-tier playlist + Push Notifications 10m+ Impressions) | N700,000",
    "Platinum package (20 A-tier playlist + Push Notifications 15m+ Impressions) | N1,000,000",
  ],
  [
    "Deezer Top 100 song chart | N400,000",
    "Deezer Top 50 song chart | N450,000",
    "Deezer Top 10 song chart | N500,000",
    "Deezer Top 1 - 10 song chart | N650,000",
  ],
  [
    "Shazam top 100 songs chart | N700,000",
    "Shazam top 50 songs chart | N900,000",
    "Shazam top 20 songs chart | N1,300,000",
    "Shazam top 10 songs chart | N2,500,000",
  ],
  [
    "Max fm | N150,000",
    "Mainland Fm | N150,000",
    "Hot fm | N150,000",
    "City fm | N180,000",
    "Rhythm fm | N200,000",
    "Naija fm | N200,000",
    "Naija fm | N200,000",
    "Wazobia fm | N250,000",
    "Beat Fm | N400,000",
    "Soundcity Radio | N550,000",
  ],
  [
    "This day | N70,000",
    "Guardian | N70,000",
    "Independent | N70,000",
    "The nation | N70,000",
    "Daily Trust | N100,000",
    "Vanguard | N100,000",
    "Blueprint | N100,000",
  ],
];

export const boomplayPackages = packagesList[0];
export const deezerPackages = packagesList[1];
export const shazamPackages = packagesList[2];
export const radioPromotionPackages = packagesList[3];
export const onlinePressPackages = packagesList[4];

export const enum promotionCategory {
  boomplay = "Boomplay",
  deezer = "Deezer",
  shazam = "Shazam",
  radioPromotion = "Radio-Promotion",
  playlistPitch = "Playlist-Pitch",
  onlinePress = "Online-Press",
}

export const deactivateReasons = [
  "No longer using the platform",
  "Duplicate account",
  "Privacy concerns",
  "Other (please specify)",
];

export const timeList = ["00:00 (UTC)","01:00 (UTC)","02:00 (UTC)","03:00 (UTC)","04:00 (UTC)","05:00 (UTC)","06:00 (UTC)","07:00 (UTC)","08:00 (UTC)","09:00 (UTC)","10:00 (UTC)","11:00 (UTC)","12:00 (UTC)","13:00 (UTC)","14:00 (UTC)","15:00 (UTC)","16:00 (UTC)", "17:00 (UTC)","18:00 (UTC)","19:00 (UTC)","20:00 (UTC)","21:00 (UTC)","22:00 (UTC)","23:00 (UTC)","24:00 (UTC)",]

export const priorityList = ["High", "Medium", "Low"];

export const genderList = ["Male", "Female"]

export const moods = ["Happy",

"Energetic",

"Party",

"Romantic",

"Heartbreak",

"Emotional",

"Inspirational",

"Chill",

"Street", 

"Conscious",

"Dark",
"Motivational",]

export const editorialTeams = [
  "Apple Music Editorial",

"Spotify Editorial",

"Audiomack Editorial",

"Tidal Editorial",

"Boomplay Editorial",

"Deezer Editorial",

"YouTube Music Editorial",
]

export const typeOfRelease = ["Standard" ,
"Remix" ,
"Reissue" ,
"Instant grat" ,
"Pre save" ,
"Alternative version" ,
"Live",
]

export const periodFilterOptions = [
  {
    label:"All Time",
    value:"all"
  },
  {
    label:"1 Week",
    value:"week"
  },
  {
    label:"Last Month",
    value:"month"
  },
  {
    label:"Last 3 Month",
    value:"3months"
  },
]
export const withdrawalStatusFilterOptions = [
  {
    label:"All",
    value:"all"
  },
  {
    label:"Pending",
    value:"pending"
  },
  {
    label:"Successful",
    value:"successful"
  },
  {
    label:"Failed",
    value:"failed"
  },
]

export const allReleaseStatusFilterOptions = [
  {
    label:"All",
    value:"all"
  },
  {
    label:"Approved",
    value:"approved"
  },
  {
    label:"Pending",
    value:"pending"
  },
  {
    label:"Rejected",
    value:"rejected"
  },
  {
    label:"Draft",
    value:"draft"
  },
]