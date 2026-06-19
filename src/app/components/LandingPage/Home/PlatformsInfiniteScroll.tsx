"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  siYoutubemusic,
  siTiktok,
  siApplemusic,
  siYoutube,
  siSpotify,
  siTidal,
  siSoundcloud,
  siSnapchat,
  siDeezer,
  siAudiomack,
  siMeta,
} from "simple-icons";

type Platform = {
  name: string;
  // simple-icons path — renders as inline SVG with full color control
  siPath?: string;
  // brand hex (no #), used as fill for siPath icons
  color: string;
  // fallback for logos not in simple-icons (Boomplay, 7digital, ACRCLOUD)
  imageSrc?: string;
};

const platforms: Platform[] = [
  {
    name: "Music",
    siPath: siYoutubemusic.path,
    color: "#" + siYoutubemusic.hex, // #FF0000
  },
  {
    name: "TikTok",
    siPath: siTiktok.path,
    color: "#FFFFFF", // brand is #000000 — use white on dark bg
  },
  {
    name: "Music",
    siPath: siApplemusic.path,
    color: "#" + siApplemusic.hex, // #FA243C
  },
  {
    name: "YouTube",
    siPath: siYoutube.path,
    color: "#" + siYoutube.hex, // #FF0000
  },
  {
    name: "Boomplay",
    imageSrc: "/boomplay.svg",
    color: "#FFFFFF", // image file — no color override needed
  },
  {
    name: "Spotify",
    siPath: siSpotify.path,
    color: "#" + siSpotify.hex, // #1ED760
  },
  {
    name: "TIDAL",
    siPath: siTidal.path,
    color: "#FFFFFF", // brand is #000000 — use white on dark bg
  },
  {
    name: "SoundCloud",
    siPath: siSoundcloud.path,
    color: "#" + siSoundcloud.hex, // #FF5500
  },
  {
    name: "Snapchat",
    siPath: siSnapchat.path,
    color: "#" + siSnapchat.hex, // #FFFC00
  },
  {
    name: "Deezer",
    siPath: siDeezer.path,
    color: "#" + siDeezer.hex, // #A238FF
  },
  {
    name: "Audiomack",
    siPath: siAudiomack.path,
    color: "#" + siAudiomack.hex, // #FFA200
  },
  {
    name: "Meta",
    siPath: siMeta.path,
    color: "#" + siMeta.hex, // #0467DF
  },
  {
    name: "7digital",
    imageSrc: "/7digitals.png",
    color: "#FFFFFF",
  },
  {
    name: "ACRCLOUD",
    imageSrc: "/acrcloud.png",
    color: "#FFFFFF",
  },
];

const duplicatedPlatforms = [...platforms, ...platforms];

export default function InfiniteLogoScroll() {
  return (
    <div className="w-full bg-black py-2 overflow-hidden relative">
      {/* Gradient fades */}
      <div className="absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      <div className="flex">
        <motion.div
          className="flex gap-x-16 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 20,
            repeat: Infinity,
          }}
        >
          {duplicatedPlatforms.map((platform, index) => (
            <div
              key={index}
              className="flex items-center gap-x-2 select-none"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                {platform.siPath ? (
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    width={20}
                    height={20}
                    fill={platform.color}
                    aria-label={platform.name}
                  >
                    <path d={platform.siPath} />
                  </svg>
                ) : (
                  <Image
                    src={platform.imageSrc!}
                    alt={platform.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                )}
              </div>

              {/* Name — always white, color lives in the icon */}
              <span className="text-sm font-bold tracking-wide text-white">
                {platform.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}