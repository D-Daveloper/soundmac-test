"use client";
import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Link from "next/link";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import ArtistInfo from "./ArtistInfo";
import ArtistEarnings from "./ArtistEarnings";
import { ChartNoAxesCombined, ChevronDown, FileSearchIcon } from "lucide-react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [isFilterOpen, setisFilterOpen] = useState(false);

  const adminartistOptions = [
    { name: "Edit details", icon: <FileSearchIcon strokeWidth={1} /> },
    {
      name: "Deactivate Artist",
      icon: <ChartNoAxesCombined strokeWidth={1} />,
    },
    {
      name: "Send Notification",
      icon: <ChartNoAxesCombined strokeWidth={1} />,
    },
    // {
    //   name: "Deactivate Artist",
    //   icon: <ChartNoAxesCombined strokeWidth={1} />,
    // },
  ];
  const { getParam, setParam } = useTabQuery();
  let tab = getParam("tab");

  useEffect(() => {
    if (!tab || (tab != "artist-info" && tab != "artist-earnings")) {
      setParam("tab", "artist-info");
    }
  }, [tab]);
  const { id } = use(params);
  if (!id) {
    return <InlineLoadingScreen />;
  }
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5 overflow-hidden">
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setParam("tab", "artist-info");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "artist-info"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Artist Info
        </button>
        <button
          onClick={() => {
            setParam("tab", "artist-earnings");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "artist-earnings"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          View Earnings
        </button>
        <div className="relative pl-6 ml-auto">
          <button onClick={()=>{setisFilterOpen(!isFilterOpen)}} className="ml-auto border-2 border-primary-500 text-text-body rounded-lg px-5 py-1 flex justify-between gap-3 items-center hover:bg-primary-500/20">
            Action{" "}
            <span className="p-1 border-2 border-primary-500 rounded-sm">
              <ChevronDown color="#11456b " size={10} />
            </span>
          </button>

          {isFilterOpen && (
            <div className="p-3 absolute top-[calc(100%+8px)] right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-40 transition-all duration-200 ease-in-out text-sm flex flex-col gap-2">
              {adminartistOptions.map((options, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setisFilterOpen(false);
                  }}
                  name={options.name}
                  aria-label={options.name}
                  className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded transition-colors"
                >
                  {options.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Link
        href={"/dashboardAdmin/all-artists"}
        aria-label="go back"
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary! text-2xl rounded-full shadow-2xl shadow-black my-2"
      >
        <Image
          src={"/arrow-left.svg"}
          height={32}
          width={32}
          alt="arrow left"
        />
      </Link>
      {tab == "artist-info" ? (
        <ArtistInfo id={id} />
      ) : tab == "artist-earnings" ? (
        <ArtistEarnings id={id} />
      ) : null}
    </div>
  );
}
