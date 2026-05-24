import Link from "next/link";
import React from "react";

const ChartCard = ({title,description,amount,country,slug}:{title: string, description: string, amount: string, country: string, slug: string}) => {
  return (
    <Link href={`/dashboard/explore/chartRegistration/${slug}`} className="w-full">
      {" "}
      <div
        className="border-2 border-neutral-100 bg-neutral-50 w-fit flex flex-col items-center rounded-lg gap-5"
      >
        <div className="bg-[#1C1C1C] w-full h-[200px] rounded-t-lg"></div>
        <div className="flex-1 p-5 flex flex-col items-center justify-center gap-3 h-[200px]">
          <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading text-center">
            <span className={`fi fi-${country} mr-2`} />
            {title}
          </h1>
          <p className="text-text-body font-medium leading-[18px] tracking-tighter text-sm text-center px-5">
            {description}
          </p>
          <p className="text-lg font-semibold mt-2 text-primary-500">
            ${amount}{" "}
            <span className="text-sm font-normal text-gray-400">/track</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ChartCard;
