import { ChartRegistration } from "@/app/type";
import Image from "next/image";
import React from "react";

const UserChartCard = ({ data }: { data: ChartRegistration }) => {
  return (
    <div className="border-1 border-neutral-100 bg-neutral-50 rounded-lg w-full h-fit flex flex-col gap-5 p-5">
      <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-primary-500">
        <span className={`fi fi-${data.countryCode} mr-2`} />
        {data.chartName}
      </h1>
      <div className="flex gap-3">
        <Image
          src={
            data.releaseId.releaseImage
          }
          alt="release image"
          width={100}
          height={100}
          className="rounded-lg object-cover w-[150px] h-[150px]"
        />
        <div className="flex flex-col justify-around gap-2">
          <h1 className="text-2xl max-sm:text-xl font-medium leading-[30px] tracking-[-1px] text-main-heading">
            {data.releaseId.releaseTitle}
          </h1>
          <p className="font-semibold text-sm leading-[20px] text-main-heading -tracking-[0.5px] line-clamp-1">
            feat: 
            {data.releaseId?.featuredArtist?.length > 0
              ? data.releaseId.featuredArtist[0].artistName
              : "No featured artists"}
          </p>
           <p
            className={
              "w-fit rounded-full font-medium text-lg leading-[20px] -tracking-[0.5px] flex items-center py-2 px-3 " +
              (data.chartStatus === "pending"
                ? " text-warning-500 bg-warning-100"
                : data.chartStatus === "approved"
                  ? " text-success-500 bg-success-100"
                  : data.chartStatus === "awaiting_payment" &&
                    " text-primary-500 bg-primary-50")
            }
          >
            {data.chartStatus}
          </p>
          <p className="font-semibold text-lg leading-[20px] text-text-body -tracking-[0.5px] line-clamp-2">
            <span className="text-main-icon-color">Date Registered: </span>
            {new Date(data.createdAt).toLocaleDateString()}
          </p>
          <hr className="w-full" />
        </div>
        
      </div>
    </div>
  );
};

export default UserChartCard;
