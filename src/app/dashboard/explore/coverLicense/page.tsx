"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Image from "next/image";
import React, { useContext, useEffect } from "react";
import { coverLincenseCardData } from "./constants";
import Link from "next/link";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Cover Song Licensing");
  }, []);
  return (
    <div className="lg:pl-[300px] bg-main-white min-h-screen w-full flex flex-col px-10 pb-30 ">
      <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 lg:max-w-[60%] text-left">
        Through our partnership with Easy Song Licensing, you can secure the
        mechanical rights needed to distribute <br /> your version of any song —
        digitally or physically. <br />
        Licenses are processed in 1–2 business days for a one-time fee starting
        at $15.99.
      </p>
      <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 mt-20 gap-5 justify-between">
        {coverLincenseCardData.map((data, index) => (
          <div
            key={index}
            className="min-w-[350px] max-lg:min-w-[300px] w-full bg-neutral-50 border border-neutral-100 flex flex-col p-5 rounded-2xl gap-8 items-center "
          >
            <p className="text-text-disable font-bold text-2xl mr-auto">
              {data.number}
            </p>

            <div className="h-[90px] w-[90px] relative">
              <Image
                src={data.image}
                alt={data.alt}
                fill
                className="object-contain"
              />
            </div>
            <p className="font-semibold text-text-body text-20 text-center">
              {data.body}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
        <Link
          href={"https://www.easysong.com/?ReferrerID=27120"}
          target="_blank"
          className={
            "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white! bg-primary-500 "
          }
        >
          Get Licensed
        </Link>
      </div>
    </div>
  );
};

export default Page;
