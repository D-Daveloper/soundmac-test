import { formatNumber } from "@/util/middleware/functions";
import Image from "next/image";
import React from "react";

const PerformanceCard = ({title,numOfTracks,image,date,streams,likes,downloads}:{title:string,numOfTracks:string,image:string,date:string,streams:string,likes:string,downloads:string}) => {
  return (
    <div className="bg-neutral-50 border border-neutral-100 w-full p-3 rounded-2xl">
      <div className="flex flex-col gap-7">
        <div className="flex gap-5 items-start">
          <div className="relative rounded-2xl max-w-[70px] max-h-[70px] min-w-[70px] min-h-[70px] w-[70px] h-[70px] flex-2">
            <Image
              priority={true}
              src={image}
              alt="an image depicting the song image"
              fill
              className="object-cover rounded-lg shadow-md max-h-[80px] "
            />
          </div>
          <div>

            <p className="text-main-heading text-2xl font-normal line-clamp-1">
              {title}
            </p>
            <p className="text-sm font-semibold text-text-body line-clamp-1">{numOfTracks} tracks</p>
            <p className="text-lg font-normal text-text-disable">
              <span className="font-semibold text-primary-500">
                Release Date:
              </span>
              {date}
            </p>
          </div>
          <div className="relative max-w-[20px] max-h-[20px] min-w-[20px] min-h-[20px] w-[20px] h-[20px] ml-auto mt-2">
            <Image
              priority={false}
              src={"/arrow-right.svg"}
              alt="an image depicting the song image"
              fill
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-neutral-100 border border-neutral-100 p-3 rounded-xl">
            <div className="flex flex-col gap-3">
              <div className="flex gap-1">
                <div className="relative rounded-sm max-w-[20px] max-h-[20px] min-w-[20px] min-h-[20px] w-[20px] h-[20px]">
                  <Image
                    priority={true}
                    src={"/music-play.png"}
                    alt="an image depicting streams"
                    fill
                    className="object-cover rounded-sm shadow-md max-h-[80px] "
                  />
                </div>
                <p className="sm:text-sm text-xs font-semibold text-text-disable line-clamp-1">
                  Streams
                </p>
              </div>
              <p className="text-xl font-normal text-text-body">
                {formatNumber(streams)}
              </p>
            </div>
          </div>
          <div className="bg-neutral-100 border border-neutral-100 p-3 rounded-xl">
            <div className="flex flex-col gap-3">
              <div className="flex gap-1">
                <div className="relative rounded-sm max-w-[20px] max-h-[20px] min-w-[20px] min-h-[20px] w-[20px] h-[20px]">
                  <Image
                    priority={true}
                    src={"/arrow-down-circle.png"}
                    alt="an image depicting downloads"
                    fill
                    className="object-cover rounded-sm shadow-md max-h-[80px] "
                  />
                </div>
                <p className="sm:text-sm text-xs font-semibold text-text-disable line-clamp-1">
                  Downloads
                </p>
              </div>
              <p className="text-xl font-normal text-text-body">
                {formatNumber(downloads)}
              </p>
            </div>
          </div>
          <div className="bg-neutral-100 border border-neutral-100 p-3 rounded-xl">
            <div className="flex flex-col gap-3">
              <div className="flex gap-1">
                <div className="relative rounded-sm max-w-[20px] max-h-[20px] min-w-[20px] min-h-[20px] w-[20px] h-[20px]">
                  <Image
                    priority={true}
                    src={"/like-tag.png"}
                    alt="an image depicting likes"
                    fill
                    className="object-cover rounded-sm shadow-md max-h-[80px] "
                  />
                </div>
                <p className="sm:text-sm text-xs font-semibold text-text-disable line-clamp-1">
                  Likes
                </p>
              </div>
              <p className="text-xl font-normal text-text-body">
                {formatNumber(likes)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
