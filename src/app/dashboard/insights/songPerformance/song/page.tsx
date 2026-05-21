"use client";
import useDebounce from "@/app/components/searchBox/searchBox";
import { songFilterOptions } from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Select from "@/components/Select";
import {
  useGetPaginatedSongPerformance,
  useGetUserArtistsNames,
} from "@/util/customHooks/useQueries";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import PerformanceCard from "./PerformanceCar";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import { Info } from "lucide-react";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("-createdAt");
  const [songStatusFilter, setSongStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("All");
  const songTitle = useDebounce<string>(query, 500);
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Song Performance");
  }, [dashboardContext]);
  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
    setPage(1);
    setSongStatusFilter("all");
  };
  const {
    isLoading: isLoadingArtistNames,
    data: artistNames,
    isPending,
    isRefetching,
  } = useGetUserArtistsNames();
  const {
    isLoading: isLoadingData,
    data: songs,
    // isPending,
    // isRefetching,
  } = useGetPaginatedSongPerformance({
    limit: "10",
    page,
    songTitle,
    artist,
  });

  console.log(songs);

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    setPage(1);
    setIsFilterOpen(false);
  };
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[305px] px-5">
      <div className="flex gap-3 mt-5">
        <Link
          href={"/dashboard/insights/songPerformance/song"}
          type="Link"
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
          }
        >
          Songs
        </Link>
        <Link
          href={"/dashboard/insights/songPerformance/album"}
          type="button"
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer hover:bg-primary-500/10 text-sm bg-transparent border-2 border-text-disable text-text-disable"
          }
        >
          Albums
        </Link>
      </div>
      {isLoadingData || !songs || !artistNames || isLoadingArtistNames ? (
        <InlineLoadingScreen />
      ) : (
        <>
          {/* filters */}
          <div>
            <div className="flex justify-between w-full mt-10 gap-2 max-[450px]:flex-col items-end">
              <div className="flex p-1 outline-1 rounded-lg w-full flex-1 [450px]:max-w-[40%] h-fit ">
                <Image
                  priority={true}
                  src="/search-normal.svg"
                  alt="search icon"
                  width={20}
                  height={20}
                />
                <input
                  value={query}
                  name="search"
                  type="search"
                  className="w-full p-1 text-[16px] sm:text-sm outline-0"
                  onChange={(e) => handleSearchQueryChange(e.target.value)}
                  placeholder="Search"
                />
              </div>
              <div className="flex-1 flex gap-10 items-end justify-end w-full">
                <div className="flex flex-col max-w-100 w-full ">
                  <p className="font-medium mb-2 sm:text-sm text-lg">Artists</p>

                  <Select
                    selected={artist}
                    setSelected={(t) => {
                      setArtist(t);
                    }}
                    placeholder="Select Artist..."
                    options={["All", ...artistNames]}
                    name="artist"
                  />
                </div>
                <button
                  disabled={false}
                  aria-label="open filters button"
                  className={
                    "outline-primary-500 outline-2 border-2 min-w-[50px] flex-1 max-w-[50px] h-[40px] rounded-lg flex flex-col justify-center items-center gap-1 relative " +
                    (false && " hover:!cursor-not-allowed ")
                  }
                  onClick={() => {
                    setIsFilterOpen(!isFilterOpen);
                    // setSelectedIndex(null);
                  }}
                >
                  <div className="bg-primary w-[25px] h-[2px]"></div>
                  <div className="bg-primary w-[15px] h-[2px]"></div>
                  <div className="bg-primary w-[10px] h-[2px]"></div>
                </button>
                {isFilterOpen && (
                  <div className="p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-40 flex flex-col gap-2">
                    {songFilterOptions.map((options, index) => (
                      <button
                        key={index}
                        onClick={() => handleFilterChange(options.value)}
                        name={options.label}
                        aria-label={options.label}
                        className=" flex items-center gap-2"
                      >
                        {" "}
                        <div
                          className={
                            "w-2 h-2 rounded-full bg-primary " +
                            (filter != options.value && " opacity-0")
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
          {/* main body */}

          {songs.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 max-lg:grid-cols-1 mt-20 gap-10 sm:m-5 ">
                {songs.data.map((item, index) => (
                  <PerformanceCard
                    key={index}
                    title={item.trackTitle}
                    featured_artist={item.featuredArtist[0].artistName}
                    date={new Date(item.releaseDate).toDateString()}
                    streams={item.totalStreams.toString()}
                    downloads={item.totalDownloads.toString()}
                    likes={item.totalLikes.toString()}
                    image={item.releaseImage}
                  />
                ))}
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={songs ? songs.totalPages : 0}
                  onChange={(page) => setPage(page)}
                />
              </div>
            </>
          ) : (
            <div
              className={
                " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
              }
            >
              <div className="flex flex-col gap-5 w-fit py-5 px-5 justify-center items-center bg-neutral-100  rounded-xl shadow-2xl max-w-[350px]">
                <div className="flex flex-col gap-2 mb-2 justify-center items-center">
                  <Info size={80} color="#999" strokeWidth={2} />
                  <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
                    Nothing here yet
                  </h3>
                  <p className="text-p font-normal text-sm leading-4 -tracking-[0.5px] text-center">
                    No analytics data is currently available for this release.
                    Streaming platforms may take a some days to begin reporting
                    streams, downloads, and audience insights.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={"/dashboard"}
                    aria-label="go to pricing page"
                    className={
                      "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm  bg-transparent border-2 border-primary-500 text-[#494949]"
                    }
                  >
                    Okay
                  </Link>
                  <Link
                    href={"/dashboard/insights/songPerformance/album"}
                    aria-label="go to pricing page"
                    className={
                      "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
                    }
                  >
                    Go to Album
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
