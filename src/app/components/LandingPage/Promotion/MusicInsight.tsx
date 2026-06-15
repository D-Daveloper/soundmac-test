import Image from "next/image";
import React from "react";
import { FaBookOpen } from "react-icons/fa";

import music from "@/assets/images/music.png";
import music1 from "@/assets/images/music1.png";
import music4 from "@/assets/images/music4.png";
import music2 from "@/assets/images/music2.png";
import music5 from "@/assets/images/music5.png";
import music9 from "@/assets/images/music9.png";
import music7 from "@/assets/images/music7.png";
import music6 from "@/assets/images/music6.png";
import music8 from "@/assets/images/music8.png";
import music3 from "@/assets/images/music3.png";

const MusicInsight = () => {
  return (
    <div className="mt-10 md:mx-10 relative">

      <div
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
        }}
      >
        {/* Col 1, Row 1 */}
        <div style={{ gridColumn: "1", gridRow: "1" }} className="relative aspect-square overflow-hidden">
          <Image src={music} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 1, Row 2 */}
        <div style={{ gridColumn: "1", gridRow: "2" }} className="relative aspect-square overflow-hidden">
          <Image src={music1} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 1, Row 3 */}
        <div style={{ gridColumn: "1", gridRow: "3" }} className="relative aspect-square overflow-hidden">
          <Image src={music4} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 2, Row 1 */}
        <div style={{ gridColumn: "2", gridRow: "1" }} className="relative aspect-square overflow-hidden">
          <Image src={music2} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 3, Row 1 */}
        <div style={{ gridColumn: "3", gridRow: "1" }} className="relative aspect-square overflow-hidden">
          <Image src={music5} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 2, Row 2 */}
        <div style={{ gridColumn: "2", gridRow: "2" }} className="relative aspect-square overflow-hidden">
          <Image src={music9} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 3, Row 2 */}
        <div style={{ gridColumn: "3", gridRow: "2" }} className="relative aspect-square overflow-hidden">
          <Image src={music7} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 2-3, Row 3 — wide, spans 2 columns */}
        <div style={{ gridColumn: "2 / 4", gridRow: "3" }} className="relative overflow-hidden">
          <Image src={music6} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 4, Row 1-2 — tall, spans 2 rows */}
        <div style={{ gridColumn: "4", gridRow: "1 / 3" }} className="relative overflow-hidden">
          <Image src={music8} alt="insight" fill className="object-cover" />
        </div>

        {/* Col 4, Row 3 */}
        <div style={{ gridColumn: "4", gridRow: "3" }} className="relative aspect-square overflow-hidden">
          <Image src={music3} alt="insight" fill className="object-cover" />
        </div>
      </div>

      {/* Overlay card — centered over the grid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto border w-[85%] md:w-fit px-2 py-2 md:px-8 md:py-6 flex flex-col items-center justify-center space-y-5 rounded-[15px] bg-white/80 backdrop-blur-sm shadow-lg md:max-w-[500px] mx-6">
          <p className="text-[#11456B] text-center text-[10px] md:text-2xl font-semibold">
            Music insights for artists
          </p>
          <p className="text-[#494949] text-[8px] md:text-sm text-center">
            Stay updated with tips, and stories to help you grow your music
            and reach more listeners
          </p>
          <button className="flex items-center w-fit px-5 py-2 gap-x-2 bg-[#11456B] rounded-[15px]">
            <p className="text-white text-[10px] md:text-[15px]">Explore Articles</p>
            <FaBookOpen className="text-white" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default MusicInsight;