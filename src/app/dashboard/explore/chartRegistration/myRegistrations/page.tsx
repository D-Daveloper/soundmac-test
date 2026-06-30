"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import useDebounce from "@/app/components/searchBox/searchBox";
import {
  chartFilter,
} from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import {
  useGetUserChartData,
} from "@/util/customHooks/useQueries";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import UserChartCard from "./UserChartCard";

const MyPromotion = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const dashboardContext = useContext(DashboardContext);
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setfilter] = useState({
    artist: "none",
    chartStatus: "all",
    // sort: "",
  });
  const releaseTitle = useDebounce<string>(query, 500);
  const { data, isLoading } = useGetUserChartData({
    page,
    limit: "10",
    releaseTitle,
    ...filter,
  });
//   const {
//     isLoading: isloadingArtistNames,
//     data: artistNames,
//     isFetching,
//     isPending,
//     isRefetching,
//     isError,
//   } = useGetUserArtistsNames();

  const handleSearchQueryChange = (filter: string) => {
    setPage(1);
    setQuery(filter);
    setfilter((prev) => ({ ...prev, chartStatus: "all" }));
  };
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("My Chart Registrations");
  }, []);

//   if (isloadingArtistNames || !artistNames) {
//     return <InlineLoadingScreen />;
//   }

  return (
    <div className="lg:pl-[280px] bg-main-white max-sm:min-h-auto min-h-[90.5dvh] h-full w-full flex flex-col px-10 pb-20">
      <div className="lg:mx-5 min-h-full">
        <div className="flex gap-2 mt-5 ">
          <Link
            href={"/dashboard/explore/chartRegistration"}
            className={
              " font-bold rounded-xl text-center max-w-fit px-5 h-10 flex items-center justify-center hover:cursor-pointer hover:bg-primary-500/20 text-sm bg-transparent border-2 border-text-disable text-text-disable"
            }
          >
            Explore
          </Link>
          <Link
            href={"/dashboard/explore/chartRegistration/myRegistrations"}
            className={
              " font-bold rounded-xl text-center max-w-fit px-5 h-10 flex items-center justify-center w-full hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
            }
          >
            My Registrations
          </Link>
        </div>
        {/* Filters */}
        <div className="w-full flex flex-wrap justify-between gap-5 items-end mt-10">
          <div className="flex p-1 outline-1 rounded-lg w-full flex-1 [450px]:max-w-[40%] h-fit ">
            <Image
              priority={true}
              src="/search-normal.svg"
              alt="search icon"
              width={20}
              height={20}
              className=" w-auto h-auto"
            />
            <input
              name="search"
              value={query}
              type="search"
              className="w-full p-1 text-[16px] sm:text-sm outline-0"
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              placeholder="Search"
            />
          </div>
          {/* <div className="flex flex-col w-[40%] max-sm:w-full gap-2 flex-1">
            <p className="font-medium mb-2 sm:text-sm text-lg">Artist</p>
            <div className="w-full">
              <Select
                selected={filter.artist}
                setSelected={(t) =>
                  setfilter((prev) => ({ ...prev, artist: t }))
                }
                placeholder="Select Artist..."
                options={["none", ...artistNames]}
                name="artist"
              />
            </div>
          </div> */}
          <div className="flex justify-end w-full flex-2 items-end">
            {/* Wrapper with relative positioning */}
            <div className="relative">
              <button
                disabled={false}
                aria-label="open filters button"
                className={
                  "outline-primary-500 outline-2 border-2 min-w-[50px] flex-1 max-w-[50px] h-[40px] rounded-lg flex flex-col justify-center items-center gap-1 " +
                  (false && " hover:!cursor-not-allowed ")
                }
                onClick={() => {
                  setisFilterOpen(!isFilterOpen);
                }}
              >
                <div className="bg-primary w-[25px] h-[2px]"></div>
                <div className="bg-primary w-[15px] h-[2px]"></div>
                <div className="bg-primary w-[10px] h-[2px]"></div>
              </button>

              {isFilterOpen && (
                <div className="p-3 absolute top-[calc(100%+8px)] right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-40 transition-all duration-200 ease-in-out text-sm flex flex-col gap-2">
                  {chartFilter.map((options, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setfilter((prev) => ({
                          ...prev,
                          chartStatus: options.value,
                        }));
                        setisFilterOpen(false);
                      }}
                      name={options.label}
                      aria-label={options.label}
                      className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div
                        className={
                          "w-2 h-2 rounded-full bg-primary " +
                          (filter.chartStatus != options.value && " opacity-0")
                        }
                      ></div>
                      {options.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {isLoading ? (
          <InlineLoadingScreen />
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="w-full h-full grid grid-cols-2 gap-5 max-mobile:grid-cols-1 max-w-[2000px] mx-auto mb-20 mt-10">
              {data.data.map((promotionContent, index) => (
                <UserChartCard
                  key={index}
                 data={promotionContent}
                />
              ))}
            </div>
            <div>
              <Pagination
                currentPage={page}
                totalPages={data ? data.totalPages : 0}
                onChange={(page) => setPage(page)}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-5 mt-30">
            <div>
              <Image
                priority={true}
                src={"/no_chart_image.svg"}
                alt="an image depicting no promotion found for the user"
                width={200}
                height={200}
              />
            </div>
            <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-icon-color">
              No Active Promotions
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] text-center">
             You don&apos;t have an active registration right now. Your details will appear here once you choose a plan.
            </p>
            <button
              onClick={() => {
                router.push("/dashboard/explore/chartRegistration");
              }}
              className={
                "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
              }
            >
              Go to Chart Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPromotion;
