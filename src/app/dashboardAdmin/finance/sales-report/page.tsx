"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { top_performing_artist } from "@/app/utils/constants";
import { useGetUserArtistsNames } from "@/util/customHooks/useQueries";
import {
  Clock4,
  FileChartLine,
  Music4,
  Users,
} from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Sales Report");
  }, []);
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetUserArtistsNames();

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
      {isLoading || !data ? (
        <InlineLoadingScreen />
      ) : (
        <div className="mt-5 flex flex-col gap-5 mb-10">
          <div className="flex justify-between items-center max-sm:flex-wrap">
            <button
              className={
                "font-bold py-2 items-center rounded-lg gap-2 px-4 h-fit hover:bg-primary/90 border-2 text-white! border-primary flex bg-primary-500 text-xs max-sm:w-fit"
              }
            >
              <FileChartLine strokeWidth={1} size={20} />
              Upload Sales Report Data
            </button>
            <button
              onClick={() => {
                //   handlePreview(songForm);
              }}
              className={
                "font-bold py-2 items-center rounded-lg gap-2 px-2 h-fit hover:bg-primary/20 border-2 text-primary border-primary flex bg-transparent text-xs max-sm:w-fit"
              }
            >
              <Clock4 strokeWidth={1} size={20} />
              View Pending
            </button>
          </div>
          <div className="flex gap-5">
            <div
              className={
                "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
                (isLoading && " shimmer")
              }
            >
              <div
                className={
                  "capitalize flex justify-between p-3 h-full " +
                  (isLoading && " hidden")
                }
              >
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="self-start w-auto h-auto"
                />
                <div className="mt4 flex flex-col gap-3">
                  <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                    ₦00.00
                  </h2>
                  <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg">
                    Total Revenue Uploaded
                  </p>
                </div>
              </div>
            </div>
            <div
              className={
                "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
                (isLoading && " shimmer")
              }
            >
              <div
                className={
                  "capitalize flex justify-between p-3 h-full " +
                  (isLoading && " hidden")
                }
              >
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="self-start w-auto h-auto"
                />
                <div className="mt4 flex flex-col gap-3">
                  <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                    ₦00.00
                  </h2>
                  <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg">
                    Total Revenue Withdrawn
                  </p>
                </div>
              </div>
            </div>

            <div
              className={
                "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
                (isLoading && " shimmer")
              }
            >
              <div
                className={
                  "capitalize flex justify-between p-3 h-full " +
                  (isLoading && " hidden")
                }
              >
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="self-start w-auto h-auto"
                />
                <div className="mt4 self-end">
                  <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg">
                    Total Earnings
                  </p>
                  <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                    ₦00.00
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-5 max-sm:flex-col">
            <div className="flex-1 flex flex-col gap-5">
              <div className="bg-neutral-50 border-1 border-neutral-100 rounded-2xl">
                <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                  <Users color="#103958" />
                  Top Performing Artists
                </p>
                <div className="grid grid-cols-3 max-md:grid-cols-2 items-center place-items-center">
                  {top_performing_artist.map((item, index) => (
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
                          src={"/radio.png"}
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
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-50 border-1 border-neutral-100 rounded-2xl">
                <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                  <Users color="#103958" />
                  Top Performing Artists
                </p>
                <div className="grid grid-cols-3 max-md:grid-cols-2 items-center place-items-center">
                  {top_performing_artist.map((item, index) => (
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
                          src={"/radio.png"}
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
                        {item.name}
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
                {top_performing_artist.map((item, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 border-2 border-neutral-100 rounded-lg flex gap-3 h-fit relative "
                  >
                    <div className="relative max-w-[100px] max-h-[100px] w-[100px] h-[100px] flex-2">
                      <Image
                        priority={true}
                        src={"/signinimage.png"}
                        alt="an image depicting the song image"
                        fill
                        className="object-cover rounded-lg shadow-md max-h-[80px] "
                      />
                    </div>
                    <div className="flex flex-col flex-2">
                      <h1 className="text-lg font-normal leading-[24px] tracking-[-0.5px] text-text-body w-full line-clamp-1">
                        {item.name}
                      </h1>
                      <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm line-clamp-2">
                        feat. {item.featuredArtist}
                      </p>
                      <p className="mt-2">
                        <span className="text-primary-500 font-bold leading-[18px] tracking-tighter text-sm">
                          Release Date:{" "}
                        </span>
                        {item.amount}
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
