"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import slideOne from "@/assets/images/f275e425ccfc90103c08dd81288130458a0ead1c.jpg";
import slideTwo from "@/assets/images/bea1867f397c0043dfc921f3b8e691c985a1f5e1.jpg";
import slideFive from "@/assets/images/214a0454d0498bc0d39d9f7f92cdb53e1a46c31a.jpg";
import slideFour from "@/assets/images/e6757fc16623d741dc5d384cbdced2447d439f9b.png";
import slideThree from "@/assets/images/1fb8f04fc3aafa31a1f711c931e86d6bc188dc4f.jpg";
import Link from "next/link";

const slides = [
  {
    image: slideOne,
    title: "Music distribution is part of the business",
    description: "We make that happen.",
    subDescription: "Music distribution to Spotify, Apple Music, YouTube, and 100+ platforms. starting from $9.99/year for independent artists"
  },
  {
    image: slideTwo,
    title: "Music distribution is part of the business",
    description: "We make that happen.",
    subDescription: "Music distribution to Spotify, Apple Music, YouTube, and 100+ platforms. starting from $9.99/year for independent artists"

  },
  {
    image: slideThree,
    title: "Music distribution is part of the business",
    description: "We make that happen.",
    subDescription: "Music distribution to Spotify, Apple Music, YouTube, and 100+ platforms. starting from $9.99/year for independent artists"

  },
  {
    image: slideFour,
    title: "Music distribution is part of the business",
    description: "We make that happen.",
    subDescription: "Music distribution to Spotify, Apple Music, YouTube, and 100+ platforms. starting from $9.99/year for independent artists"

  },

  {
    image: slideFive,
    title: "Music distribution is part of the business",
    description: "We make that happen.",
    subDescription: "Music distribution to Spotify, Apple Music, YouTube, and 100+ platforms. starting from $9.99/year for independent artists"

  },
];

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden">
      {/* Slides/Images Container */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={`Music Distribution slide ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover brightness-[0.6]"
            />
          </div>
        ))}
      </div>

      {/* Center-Aligned Content Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 lg:px-12 z-20 pointer-events-none">
        <h2 className="text-[#F9F9F9] lg:text-6xl font-semibold tracking-tight leading-tight drop-shadow-md transition-all duration-500">
          {slides[currentIndex].title}
        </h2>
        <p className="text-[#E48E59] lg:text-5xl font-semibold mt-2 drop-shadow-sm transition-all duration-500">
          {slides[currentIndex].description}
        </p>
         <p className="text-[#F9F9F9] text-sm font-semibold mt-3 max-w-[500px] lg:mt-4 drop-shadow-sm transition-all duration-500">
          {slides[currentIndex].subDescription}
        </p>

        {/* Action Button */}
        <div className="mt-8 pointer-events-auto">
          <Link href={'/register'} className="bg-[#11456B] hover:bg-[#155685] text-white font-bold text-sm lg:text-base px-7 py-3 rounded-md shadow-lg hover:scale-105 transition-all duration-300">
            <span className="text-white">Start Now</span> 
          </Link>
        </div>
      </div>
    </div>
  );
}
