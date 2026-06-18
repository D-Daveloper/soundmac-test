"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import PromotionImage from "@/assets/images/promotion.jpg";
import promoArtist1 from "@/assets/images/promoArtist1.jpg";
import promoArtist2 from "@/assets/images/promoArtist2.jpg";
import promoArtist3 from "@/assets/images/promoArtist3.jpg";

import {
  IoMdInformationCircle,
  IoMdArrowBack,
  IoMdArrowForward,
} from "react-icons/io";
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
            Personal stories from our artist using soundmac to take over the global stage and grow their music 
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto py-4">
          {/* Card 1 - Zyno Wave */}
          <div className="relative group overflow-hidden rounded-[24px] shadow-xl w-full max-w-[340px] mx-auto bg-neutral-900 transition-all duration-300 hover:scale-[1.02]">
            <div
              className="absolute inset-0 z-[1] opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "12px 12px",
              }}
            />
            <Image
              src={promoArtist2}
              alt="Artist testimonial by Zyno Wave"
              width={340}
              height={400}
              className="object-cover w-full h-[400px] brightness-[0.85] transition-all duration-500 group-hover:scale-105"
            />
            <button
              aria-label="More information"
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 shadow-md z-10 cursor-pointer"
            >
              <IoMdInformationCircle size={20} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-[20px] flex flex-col gap-3 justify-center items-center shadow-2xl transition-all duration-300 group-hover:bg-black/75 z-10">
              <p className="text-[#F9F9F9] text-[12px] leading-relaxed text-center font-medium tracking-wide">
                "Soundmac made releasing my music simple. I uploaded once and my
                song was everywhere. The analytics also helped me understand my
                audience better."
              </p>
              <p className="text-[#F9F9F9] text-center text-sm font-semibold tracking-wider">
                ~ Zyno Wave
              </p>
            </div>
          </div>

          {/* Card 2 — Ama Rey */}
          <div className="relative group overflow-hidden rounded-[24px] shadow-xl w-full max-w-[340px] mx-auto bg-[#B8860B] transition-all duration-300 hover:scale-[1.02]">
            <div
              className="absolute inset-0 z-[1] opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "12px 12px",
              }}
            />
            <Image
              src={promoArtist1}
              alt="Artist testimonial by Ama Rey"
              width={340}
              height={400}
              className="object-cover w-full h-[400px] brightness-[0.85] transition-all duration-500 group-hover:scale-105"
            />
            <button
              aria-label="More information"
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 shadow-md z-10 cursor-pointer"
            >
              <IoMdInformationCircle size={20} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-[20px] flex flex-col gap-3 justify-center items-center shadow-2xl transition-all duration-300 group-hover:bg-black/75 z-10">
              <p className="text-[#F9F9F9] text-[12px] leading-relaxed text-center font-medium tracking-wide">
                "Soundmac made releasing my music simple. I uploaded once and my
                song was everywhere. The analytics also helped me understand my
                audience better."
              </p>
              <p className="text-[#F9F9F9] text-center text-sm font-semibold tracking-wider">
                ~ Ama Rey
              </p>
            </div>
          </div>

          {/* Card 3 — J. Blake */}
          <div className="relative group overflow-hidden rounded-[24px] shadow-xl w-full max-w-[340px] mx-auto bg-neutral-900 transition-all duration-300 hover:scale-[1.02]">
            <div
              className="absolute inset-0 z-[1] opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "12px 12px",
              }}
            />
            <Image
              src={promoArtist3}
              alt="Artist testimonial by J. Blake"
              width={340}
              height={400}
              className="object-cover w-full h-[400px] brightness-[0.85] transition-all duration-500 group-hover:scale-105"
            />
            <button
              aria-label="More information"
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 shadow-md z-10 cursor-pointer"
            >
              <IoMdInformationCircle size={20} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-[20px] flex flex-col gap-3 justify-center items-center shadow-2xl transition-all duration-300 group-hover:bg-black/75 z-10">
              <p className="text-[#F9F9F9] text-[12px] leading-relaxed text-center font-medium tracking-wide">
                "The platform is clean and easy to use. From distribution to
                tracking performance, everything just works."
              </p>
              <p className="text-[#F9F9F9] text-center text-sm font-semibold tracking-wider">
                ~ J. Blake
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="hidden md:flex items-center justify-center gap-x-3 pt-2">
          <button className="bg-[#11456B] hover:bg-[#0e3654] transition-colors rounded-[12px] px-6 py-2 shadow-sm cursor-pointer">
            <IoMdArrowBack className="text-white" size={20} />
          </button>
          <button className="bg-[#11456B] hover:bg-[#0e3654] transition-colors rounded-[12px] px-6 py-2 shadow-sm cursor-pointer">
            <IoMdArrowForward className="text-white" size={20} />
          </button>
        </div>

        <PromoPackages />
        <MusicInsight />
      </section>
    </>
  );
};

export default Page;
