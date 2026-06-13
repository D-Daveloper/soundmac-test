import Image from "next/image";
import React from "react";
// import promoartist1 from "@/assets/images/promoArtist1.jpg";
import promoCard1 from "@/assets/images/e7aa2d85c29a621740853787232be6dff1702174 (1).jpg";
import promoCard2 from "@/assets/images/05d0f54da0d9611f02bdf29e415c86664b458a68.jpg";
import promoCard3 from "@/assets/images/9c47a3bbcdb3609e20476933d1cba9a7ecdc87aa.png";

const PromoPackages = () => {
  return (
    <div className="mx-10 mt-10">
      <p className="text-center text-2xl md:text-3xl font-semibold">
        Top tier promo packages for you
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:mt-10 mt-5 px-6 max-w-6xl mx-auto py-12">
        <div className="bg-[#F4F4F4] rounded-t-full rounded-b-2xl pb-6 flex flex-col items-center overflow-hidden shadow-sm">
          <Image
            src={promoCard1}
            alt="Playlist Pitching feature presentation"
            width={300}
            height={300}
            className="rounded-t-full w-full h-[160px] md:h-[240px] my-3 object-cover"
          />
          <div className="px-6 mt-2 text-center">
            <p className="text-[#333333] font-bold text-lg tracking-wide mb-1">
              Playlist Pitching
            </p>
            <p className="text-[#494949] text-[10px] md:text-sm leading-relaxed">
              Get your music submitted to curated playlists to reach new
              listeners.
            </p>
          </div>
        </div>

        <div className="bg-[#F4F4F4] rounded-t-full rounded-b-2xl pb-6 flex flex-col items-center overflow-hidden shadow-sm">
          <Image
            src={promoCard2}
            alt="Radio Promotions feature presentation"
            width={300}
            height={300}
            className="rounded-t-full w-full h-[160px] md:h-[240px] my-3 object-cover"
          />
          <div className="px-6 mt-2 text-center">
            <p className="text-[#333333] font-bold text-lg tracking-wide mb-1">
              Radio Promotions
            </p>
            <p className="text-[#494949] text-[10px] md:text-sm leading-relaxed">
              Push your music to radio stations across Nigeria for wider local
              reach
            </p>
          </div>
        </div>

        <div className="bg-[#F4F4F4] rounded-t-full rounded-b-2xl pb-6 flex flex-col items-center overflow-hidden shadow-sm">
          <Image
            src={promoCard3}
            alt="Online Press feature presentation"
            width={300}
            height={300}
            className="rounded-t-full w-full h-[160px] md:h-[240px] my-3 object-cover"
          />
          <div className="px-6 mt-2 text-center">
            <p className="text-[#333333] font-bold text-lg tracking-wide mb-1">
              Online Press
            </p>
            <p className="text-[#494949] text-[10px] md:text-sm leading-relaxed">
              Get featured on blogs and media platforms to boost your artist
              profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPackages;
