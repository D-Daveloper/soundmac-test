import { promotionCategory } from "@/app/constant";
import { Repeat } from "lucide-react";
import Image from "next/image";
import React from "react";

const PromotionCard = ({
  category,
  songtitle,
  packageType,
  startDate,
  endDate,
  isActive,
  handleSubmit
}: {
  category: promotionCategory;
  songtitle: string;
  packageType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  handleSubmit: () => void;
}) => {
  return (
    <div className="border-1 border-neutral-100 bg-neutral-50 rounded-lg max-w-[550px] w-full max-mobile:max-w-full h-fit flex flex-col gap-5 p-5">
      <div className="flex gap-3">
        <Image
          src={ category === "Radio-Promotion"? "/radio.png" : category === "Boomplay"? "/boomplay.jpg" : category === "Playlist-Pitch"? "/pitchplay.jpg": category === "Online-Press"? "/onlinepress.png" : "/boomplay.jpg"}
          alt="Promotion image"
          width={80}
          height={80}
          className="rounded-lg object-cover w-[100px] h-[80px]"
        />
        <div className="flex flex-col justify-around">
          <h1 className="text-2xl max-sm:text-xl font-medium leading-[30px] tracking-[-1px] text-main-heading">
            {category}
          </h1>
          <p className="font-semibold text-lg leading-[20px] text-text-body -tracking-[0.5px] line-clamp-2">
            <span className="text-main-icon-color">Song: </span>
            {songtitle}
          </p>
          <hr className="w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className=" font-medium text-lg leading-[20px] text-text-body -tracking-[0.5px] line-clamp-2">
          <span className="font-semibold text-main-icon-color">Package: </span>
          {packageType}
        </p>
        <div className="flex justify-between gap-2 flex-wrap">
          <p className=" font-medium text-lg leading-[20px] text-text-body -tracking-[0.5px]">
            <span className="font-semibold text-main-icon-color">
              Start Date:{" "}
            </span>
            {new Date(startDate).toLocaleDateString()}
          </p>
          <p className=" font-medium text-lg leading-[20px] text-warning-600 -tracking-[0.5px]">
            <span className="font-semibold">Start Date: </span>
            {new Date(endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between gap-2 flex-wrap">
          <button
            disabled={isActive === false? false : true}
            onClick={() => {
              // setIsExplorePage(true);
              handleSubmit();
            }}
            type="button"
            className={
              "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm flex gap-3 text-main-white " +
              (!isActive
                ? " bg-primary hover:bg-btn-hover "
                : " bg-btn-disabled")
            }
          >
            Promote Again
            <div className="rounded-full border-2 border-main-white max-w-fit p-1">
              <Repeat size={10} />
            </div>
          </button>
          <p
            className={
              " rounded-lg font-medium text-lg leading-[20px] -tracking-[0.5px] flex items-center " +
              (isActive
                ? " bg-success-100 text-success-500 px-3 py-1"
                : " text-error-500 bg-error-50 px-3 py-1")
            }
          >
            {isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
