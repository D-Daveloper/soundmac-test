"use client";

import { motion } from "framer-motion";
import { FaSpotify, FaTiktok, FaApple, FaYoutube } from "react-icons/fa";
import { SiTidal, SiYoutubemusic } from "react-icons/si";
import Image from "next/image";

type Platform = {
  name: string;
  icon: React.ReactNode | string;
  color?: string;
};

const platforms: Platform[] = [
  { name: "Music", icon: <SiYoutubemusic className="text-[#FF0000]" /> },
  { name: "TikTok", icon: <FaTiktok className="text-[#F9F9F9]" /> },
  // { name: "Music", icon: <FaYoutube className="text-[#FF0000]" /> },
  { 
    name: "Boomplay", 
    icon: "/boomplay.svg", 
  },
  { 
    name: "Spotify", 
    icon: <FaSpotify className="text-[#1ED760]" />,
    color: "#1ED760"
  },
  { name: "TIDAL", icon: <SiTidal className="text-white" /> },
];

export default function InfiniteLogoScroll() {
  const duplicatedPlatforms = [...platforms, ...platforms];

  return (
    <div className="w-full bg-black py-2 overflow-hidden relative">
      {/* Gradient fades */}
      <div className="absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      <div className="flex">
        <motion.div
          className="flex gap-x-16 md:gap-x-24 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
        >
          {duplicatedPlatforms.map((platform, index) => (
            <div
              key={index}
              className="flex items-center gap-x-0 text-white select-none"
            >
              <div className="text-md flex items-center justify-center w-8 h-8">
                {typeof platform.icon === "string" ? (
                  <Image
                    src={platform.icon}
                    alt={platform.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  platform.icon
                )}
              </div>
              
              <span 
                className={`text-md font-bold tracking-wide ${
                  platform.color ? `text-[${platform.color}]` : ""
                }`}
              >
                {platform.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}