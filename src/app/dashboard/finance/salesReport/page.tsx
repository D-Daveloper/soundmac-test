"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Select from "@/components/Select";
import {
  useGetUserArtistsNames,
  useGetUserSalesReportDashboardDetailsNames,
} from "@/util/customHooks/useQueries";
import { formatAmount } from "@/util/middleware/functions";
import {
  CircleDollarSign,
  Clock4,
  Coins,
  FileDown,
  Music4,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [salesReportForm, setsalesReportForm] = useState({
    artist: "",
    timeLine: "",
  });

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Sales Report");
  }, []);
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetUserArtistsNames();
  const { isLoading: isLoadingSalesReport, data: salesReport } =
    useGetUserSalesReportDashboardDetailsNames();

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[300px] px-5">
      {isLoading || !data || isLoadingSalesReport || !salesReport ? (
        <InlineLoadingScreen />
      ) : (
        <div className="mt-5 flex flex-col gap-5 mb-10">
          <div className="flex justify-between items-center max-sm:flex-wrap">
            <div className="w-full flex flex-wrap justify-between gap-y-5 mb-5 max-w-[500px]">
              <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                <p className="font-medium mb-2 sm:text-sm text-lg">Period</p>
                <div className="w-full">
                  <Select
                    selected={salesReportForm.timeLine}
                    setSelected={(t) =>
                      setsalesReportForm((prev) => ({ ...prev, timeLine: t }))
                    }
                    placeholder="Select Period..."
                    options={[]}
                    name="artist"
                  />
                </div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                <p className="font-medium mb-2 sm:text-sm text-lg">Artist</p>
                <div className="w-full">
                  <Select
                    selected={salesReportForm.artist}
                    setSelected={(t) =>
                      setsalesReportForm((prev) => ({ ...prev, artist: t }))
                    }
                    placeholder="Select Artist..."
                    options={data}
                    name="artist"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                //   handlePreview(songForm);
              }}
              className={
                "font-bold py-2 items-center rounded-lg gap-2 px-2 h-fit hover:bg-primary/20 border-2 text-primary border-primary flex bg-transparent text-xs max-sm:w-fit"
              }
            >
              Download Sales Report
              <Clock4 strokeWidth={1} size={20} />
            </button>
          </div>
          <div className="flex justify-between flex-wrap">
            <div className="w-full flex gap-5 max-w-[600px] mb-5 max-sm:flex-wrap">
              <Link
                href={"salesReport/withdrawal"}
                className={
                  "font-bold py-2 items-center rounded-lg gap-2 px-2 h-fit hover:bg-primary/90 border-2 text-white! border-primary flex bg-primary-500 text-xs max-sm:w-fit"
                }
              >
                Withdraw Royalties
                <CircleDollarSign strokeWidth={1} size={20} />
              </Link>
              <Link
                href={"salesReport/history"}
                className={
                  "font-bold py-2 items-center rounded-lg gap-2 px-2 h-fit hover:bg-primary/20 border-2 text-primary border-primary flex bg-transparent text-xs max-sm:w-fit"
                }
              >
                View History
                <Clock4 strokeWidth={1} size={20} />
              </Link>
            </div>
            <Link
              href={"salesReport/advancedRoyalty"}
              className={
                "font-bold py-2 items-center rounded-lg gap-2 px-2 h-fit hover:bg-primary/20 border-2 text-primary border-primary flex bg-transparent text-xs max-sm:w-fit"
              } 
            >
              Advance Royalties
              <FileDown strokeWidth={1} size={20} />
            </Link>
          </div>
          <div className="flex gap-5 max-sm:flex-col">
            <div className="flex-1 flex flex-col gap-5">
              <div className="bg-warning-50 flex flex-col w-full gap-5 p-5 rounded-2xl">
                <h1 className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500">
                  <Coins color="#103958" /> Total Earnings
                </h1>
                <p className="font-bold leading-[60px] -tracking-widest text-4xl text-primary-500">
                  {salesReport.totals.length > 0
                    ? formatAmount(salesReport.totals[0]?.totalNetAmount)
                    : "$ " + 0}
                </p>
              </div>
              <div className="bg-neutral-50 border-1 border-neutral-100 rounded-2xl">
                <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                  <Users color="#103958" />
                  Top Performing Artists
                </p>
                <div className="grid grid-cols-3 max-md:grid-cols-2 items-center place-items-center">
                  {salesReport?.topArtists.length > 0 &&
                    salesReport.topArtists.map((item, index) => (
                      <div
                        key={index}
                        className={
                          "flex justify-center items-center flex-col " +
                          (index == 2 && " max-md:col-span-2")
                        }
                      >
                        <div className="min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] relative">
                          <Image
                            priority={true}
                            loading="eager"
                            src={item.artist.artistImage ?? "/radio.png"}
                            alt="Profile picture"
                            fill
                            className="object-cover rounded-full "
                          />
                        </div>
                        <p
                          className={
                            "font-semibold text-xl flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5 text-center! "
                          }
                        >
                          {item.artist.artistName}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex-1 border-1 border-neutral-100 rounded-2xl">
              <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                <Music4 color="#103958" />
                Top Performing Songs
              </p>
              <div className="p-5 flex flex-col gap-5">
                {salesReport.topSongs.length > 0 &&
                  salesReport.topSongs.map((item, index) => (
                    <div
                      key={index}
                      className="bg-neutral-50 border-2 border-neutral-100 rounded-lg flex gap-3 h-fit relative "
                    >
                      <div className="relative max-w-[100px] max-h-[100px] w-[100px] h-[100px] flex-2">
                        <Image
                          priority={true}
                          src={item.song.releaseImage ?? "/signinimage.png"}
                          alt="an image depicting the song image"
                          fill
                          className="object-cover rounded-lg shadow-md max-h-[80px] "
                        />
                      </div>
                      <div className="flex flex-col flex-2">
                        <h1 className="text-lg font-normal leading-[24px] tracking-[-0.5px] text-text-body w-full line-clamp-1">
                          {item.song.releaseTitle}
                        </h1>
                        <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm line-clamp-2">
                          feat. {item.song.featuredArtist[0].artistName}
                        </p>
                        <p className="mt-2">
                          <span className="text-primary-500 font-bold leading-[18px] tracking-tighter text-sm">
                            Revenue:{" "}
                          </span>
                          ${item.totalRevenue}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
