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
    <div className="w-full gap-2 h-fit flex flex-col justify-between">
      <div className="w-full gap-5 flex justify-between items-center">
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
            <h1 className="text-[#000000] font-normal leading-[30px] tracking-tighter text-2xl w-full">
              {Props.releaseTitle}
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
              ~{Props.artistName}
              {Props.featuredArtist && "(" + Props.featuredArtist.join(",") + ")"}
            </p>
          </div>
        </div>

        {/* releaseDate and time */}
        <div className=" flex bg-secondary-50 p-3 rounded-full max-w-fit text-text-body font-medium text-md leading-5 tracking-tighter">
          <p>{new Date(Props.releaseDate).toDateString()}</p>
        </div>
      </div>

      {/* border line */}
      <div className="border w-full border-neutral-200"></div>
    </div>
  );
};

export default ReleaseComp;
