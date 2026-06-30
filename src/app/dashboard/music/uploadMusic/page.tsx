"use client";
import Image from "next/image";
import React, { useContext, useEffect } from "react";
import SongForm from "./song/SongForm";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import AlbumForm from "./album/AlbumForm";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const Page = () => {
  const { setParam, getParam } = useTabQuery();
  const type = getParam("type");
    const dashboardContext = useContext(DashboardContext);
    useEffect(() => {
    dashboardContext?.setHeader({title: "Upload Release", showBackButton:true});
  }, [type]);

  if (type == "single") {
    return <SongForm />;
  } else if (type === "album") {
    return <AlbumForm />;
  } else {
    return (
    <main className="lg:pl-[280px] px-4 w-full min-h-screen bg-main-white text-[14px] -tracking-[0.5px] leading-5 flex flex-col py-5 border border-red-50">
        <div>
          <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
            Choose Your Release Type
          </h1>
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3">
            Decide how you want to share your music - as a single track or a
            full album.
          </p>
        </div>
        <div className="flex w-full justify-between gap-7 mt-10 max-sm:flex-col text-center">
          <div className="py-5 h-[450px] bg-neutral-50 border-2 border-neutral-100 rounded-lg flex-1 flex flex-col items-center justify-center gap-5">
            <Image
              src={"/uploadsong.svg"}
              alt="upload song icon"
              width={0}
              height={0}
              className="w-full h-[130px] object-contain"
            />
            <h2 className="text-2xl font-bold leading-[30px] tracking-[-1px] text-main-heading">
              Single
            </h2>
            <p className="max-w-[80%] text-text-disable font-normal leading-[16px] tracking-[-0.5px] text-sm">
              Upload one track and get it streaming everywhere.
            </p>
            <button
              onClick={() => setParam("type", "single")}
              className="font-bold text-sm rounded-lg bg-primary text-main-white px-4 py-2.5 hover:bg-primary/80"
            >
              Upload Single
            </button>
          </div>
          <div className="py-5 h-[450px] bg-neutral-50 border-2 border-neutral-100 rounded-lg flex-1 flex flex-col items-center justify-center gap-5">
            <Image
              src={"/uploadalbum.svg"}
              alt="upload song icon"
              width={0}
              height={0}
              className="w-full h-[130px] object-contain"
            />
            <h2 className="text-2xl font-bold leading-[30px] tracking-[-1px] text-main-heading">
              Album
            </h2>
            <p className="max-w-[80%] text-text-disable font-normal leading-[16px] tracking-[-0.5px] text-sm">
              Share a collection of songs as one complete project.
            </p>
            <button
              onClick={() => setParam("type", "album")}
              className="font-bold text-sm rounded-lg bg-transparent border-2 border-primary text-text-body px-4 py-2.5 hover:bg-primary/10"
            >
              Upload Album
            </button>
          </div>
        </div>
      </main>
    );
  }
};

export default Page;
