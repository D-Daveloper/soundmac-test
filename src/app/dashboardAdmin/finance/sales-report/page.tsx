"use client";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5 overflow-hidden">
      <div className="flex gap-3 mt-5">
        <Link
          href={"/dashboardAdmin/music/all-releases/single"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
          }
        >
          Songs
        </Link>
        <Link
          href={"/dashboardAdmin/music/all-releases/album"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-transparent border-2 border-text-disable text-text-disable"
          }
        >
          Albums
        </Link>
      </div>
    </div>
  );
};

export default Page;
