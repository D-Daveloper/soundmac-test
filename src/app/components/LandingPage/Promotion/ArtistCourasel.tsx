"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { IoMdArrowBack, IoMdArrowForward, IoMdInformationCircle } from "react-icons/io";

type Artist = {
  image: StaticImageData;
  name: string;
  quote: string;
  bg: string;
  dotOpacity: number;
};

type ArtistCarouselProps = {
  artists: Artist[];
};

export default function ArtistCarousel({ artists }: ArtistCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [desktopVisible, setDesktopVisible] = useState(3);
  const touchStartX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Determine how many cards fit based on container width
  useEffect(() => {
    const update = () => {
      setDesktopVisible(window.innerWidth < 768 ? 1 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const total = artists.length;
  const maxIndex = total - desktopVisible;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  // Touch swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) next();
    else if (delta < -40) prev();
    touchStartX.current = null;
  };

  // Dot count — one dot per "page" on desktop, one per card on mobile
  const dotCount = desktopVisible === 1 ? total : maxIndex + 1;

  return (
    <section className="w-full overflow-hidden py-4">
      {/* Track */}
      <div
        ref={trackRef}
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(calc(-${current} * (100% / ${desktopVisible})))`,
          }}
        >
          {artists.map((artist, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / desktopVisible}%` }}
            >
              <div
                className="relative group overflow-hidden rounded-[24px] shadow-xl w-full max-w-[340px] mx-auto transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: artist.bg }}
              >
                {/* Dot pattern overlay */}
                <div
                  className="absolute inset-0 z-[1] pointer-events-none"
                  style={{
                    opacity: artist.dotOpacity,
                    backgroundImage:
                      "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                />

                {/* Artist image */}
                <Image
                  src={artist.image}
                  alt={`Artist testimonial by ${artist.name}`}
                  width={340}
                  height={400}
                  className="object-cover w-full h-[400px] brightness-[0.85] transition-all duration-500 group-hover:scale-105"
                />

                {/* Info button */}
                <button
                  aria-label="More information"
                  className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-black transition-all duration-300 shadow-md z-10 cursor-pointer"
                >
                  <IoMdInformationCircle size={20} />
                </button>

                {/* Quote card */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-[20px] flex flex-col gap-3 justify-center items-center shadow-2xl transition-all duration-300 group-hover:bg-black/75 z-10">
                  <p className="text-[#F9F9F9] text-[12px] leading-relaxed text-center font-medium tracking-wide">
                    "{artist.quote}"
                  </p>
                  <p className="text-[#F9F9F9] text-center text-sm font-semibold tracking-wider">
                    ~ {artist.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-x-4 pt-6">
        {/* Prev button */}
        <button
          onClick={prev}
          disabled={current === 0}
          aria-label="Previous"
          className="bg-[#11456B] hover:bg-[#0e3654] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-[12px] px-6 py-2 shadow-sm cursor-pointer"
        >
          <IoMdArrowBack className="text-white" size={20} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: current === i ? "20px" : "8px",
                height: "8px",
                backgroundColor:
                  current === i ? "#11456B" : "rgba(17,69,107,0.3)",
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={current >= maxIndex}
          aria-label="Next"
          className="bg-[#11456B] hover:bg-[#0e3654] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-[12px] px-6 py-2 shadow-sm cursor-pointer"
        >
          <IoMdArrowForward className="text-white" size={20} />
        </button>
      </div>
    </section>
  );
}