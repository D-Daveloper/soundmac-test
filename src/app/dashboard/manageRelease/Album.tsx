import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const Album = () => {
  const router = useRouter();
  return (
    <div className="bg-main-white  max-sm:min-h-auto min-h-[90dvh] h-full w-full flex flex-col px-10 ">
      <div className="flex flex-col justify-center items-center h-full gap-15 min-h-[90dvh]">
        <div>
          <Image
            priority={true}
            src={"/manage_album_image.png"}
            alt="an image depicting no artist profile"
            width={100}
            height={100}
          />
        </div>
        <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
          You haven’t released any albums. Create and share a collection of songs with your fans.
        </p>
        <button
          onClick={() => {
            router.push("/dashboard?tab=Music&section=uploadMusic&type=album");
          }}
          className={
            "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
          }
        >
          Upload a Album
        </button>
      </div>
    </div>
  );
};

export default Album;
