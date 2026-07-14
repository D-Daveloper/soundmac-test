import Image from "next/image";
import React from "react";

export type Props = {
  artistName: string;
  featuredArtist?: string[];
  releaseTitle: string;
  releaseDate: string;
};

const ReleaseComp = (Props: Props) => {
  return (
    <div className="w-full gap-3 h-fit flex flex-col justify-between">
      <div className="w-full gap-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-3">
          <div className="relative max-w-[80px] max-h-[70px] w-[80px] h-[70px]">
            <Image
              priority={true}
              src={"/signinimage.png"}
              alt="an image depicting the song image"
              fill
              className="object-cover rounded-lg shadow-md max-h-[70px] "
            />
          </div>
          <div>
            <h1 className="text-[#000000] font-normal leading-[30px] tracking-tighter text-xl w-full">
              {Props.releaseTitle}
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
              ~{Props.artistName}
              {Props.featuredArtist &&
                "(" + Props.featuredArtist.join(",") + ")"}
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto flex bg-secondary-50 px-3 py-1.5 sm:p-3 rounded-full text-text-body font-medium text-xs sm:text-md leading-none tracking-tighter">
          <p>{new Date(Props.releaseDate).toDateString()}</p>
        </div>
      </div>

      <div className="border-b w-full border-neutral-200 pt-2"></div>
    </div>
  );
};

export default ReleaseComp;
