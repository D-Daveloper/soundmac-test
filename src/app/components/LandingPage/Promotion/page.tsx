"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import PromotionImage from "@/assets/images/promotion.jpg";
import ArtistCarousel from "../Promotion/ArtistCourasel";
import { artists} from './Artists'
import { FaPlay } from "react-icons/fa";

import PromoPackages from "./PromoPackages";
import MusicInsight from "./MusicInsight";

// Dynamic MotionSpan (fixes server error)
const MotionSpan = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.span),
  { ssr: false },
);

// Auto-repeating Animated Counter
const AnimatedCounter = () => {
  const [count, setCount] = useState(0);
  const [key, setKey] = useState(0);

  // Trigger count animation
  const startCounting = () => {
    setCount(0);
    setKey((prev) => prev + 1);
  };

  // Auto restart every 5 seconds
  useEffect(() => {
    startCounting();

    const interval = setInterval(() => {
      startCounting();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Counting logic
  useEffect(() => {
    let start = 0;
    const end = 10000;
    const duration = 1800;
    const increment = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.min(start, end));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [key]);

  return (
    <MotionSpan
      key={key}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-[#FF6B00] font-bold inline-block md:min-w-[110px] w-[100px] text-center"
    >
      {count.toLocaleString()}+
    </MotionSpan>
  );
};


const Page = () => {
  return (
    <>
      <section className="px-5 md:px-14 lg:mx-10 mt-10 space-y-10">
        <div>
          <p className="text-[#333333] font-semibold text-2xl md:text-3xl tracking-tight leading-tight">
            More than <AnimatedCounter /> artists and labels trust soundmac
          </p>

          <p className="text-[#333333] text-sm pt-3 pb-6 max-w-xl lg:max-w-2xl leading-relaxed">
            Personal stories from our artist using soundmac to take over the
            global stage and grow their music
          </p>

          {/* Video Banner */}
          <div className="relative w-full max-w-6xl mx-auto rounded-[20px] overflow-hidden group shadow-md cursor-pointer">
            <Image
              src={PromotionImage}
              alt="Artists video documentary showcase banner"
              width={1400}
              height={400}
              priority={true}
              className="w-full h-[250px] md:h-[350px] object-cover brightness-[0.85] transition-all duration-500 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-300 group-hover:bg-black/20">
              <div className="bg-white/90 backdrop-blur-sm hover:bg-white h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 text-[#11456B]">
                <FaPlay size={18} className="ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Grid */}
        <ArtistCarousel artists={artists} />
        <PromoPackages />
        <MusicInsight />
      </section>
    </>
  );
};

export default Page;
