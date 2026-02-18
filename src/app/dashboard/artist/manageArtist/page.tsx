"use client";
import {
  InlineLoadingScreen,
  NormalLoadingScreen,
} from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import useDebounce from "@/app/components/searchBox/searchBox";
import { filterOptions } from "@/app/constant";
import { Artist } from "@/app/type";
import { usePaginatedArtists } from "@/util/customHooks/useQueries";
import { FileSearchIcon, ChartNoAxesCombined } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import ViewArtist from "./ViewArtist";
import ViewStats from "./ViewStats";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const artistOptions = [
  { name: "View", icon: <FileSearchIcon strokeWidth={1} /> },
  { name: "Stats", icon: <ChartNoAxesCombined strokeWidth={1} /> },
];
const ManageArtist = () => {
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const [viewArtist, setViewArtist] = useState<null | Artist>(null);
  const [viewStats, setViewStats] = useState<null | Artist>(null);
  const [filter, setFilter] = useState("createdAt");
  const [query, setQuery] = useState("");
  const artistNam = useDebounce<string>(query, 500);
  const { data, isLoading, isError, error, isFetching } = usePaginatedArtists({
    page,
    sort: filter,
    artistName: artistNam,
  });
  const router = useRouter();
  const dashboardContext = useContext(DashboardContext);
  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    setPage(1);
    setIsFilterOpen(false);
  };
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Manage Artists");
  }, []);
  const handleArtistOptionChange = (index: number) => {
    setIsFilterOpen(false);
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(index);
  };
  useEffect(() => {
    setIsFilterOpen(false);
    setSelectedIndex(null);
  }, [query, page]);
  // if (isLoading) {
  //   return <NormalLoadingScreen />;
  // }
  // if (
  //   !isLoading &&
  //   !isError &&
  //   data != undefined &&
  //   data.totalCount === 0 &&
  //   query.trim() !== ""
  // ) {
  //   toast.info("No artist profiles found matching your search.");
  // }
  if (viewArtist) {
    return <ViewArtist artist={viewArtist} setArtist={setViewArtist} />;
  } else if (viewStats) {
    return (
      <ViewStats
        artistToViewStats={viewStats}
        setArtistToViewStats={setViewStats}
      />
    );
  }
  return (
    <div className="bg-main-white  min-h-[90dvh] w-full flex flex-col px-10 lg:pl-[260px] ">
      {isLoading ? (
        <InlineLoadingScreen />
      ) : !isLoading && (isError || data === undefined ||data.data.length === 0) ? (
        <div className="flex flex-col justify-center items-center min-h-[90dvh] gap-15">
          <div>
            <Image
              priority={true}
              src={"/manage_artist_image.png"}
              alt="an image depicting no artist profile"
              width={200}
              height={200}
            />
          </div>
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
            No Artist Profile Yet. Create your first artist profile to start
            releasing and managing music.
          </p>
          <button
            onClick={() => {
              router.push("/dashboard?tab=Artists&section=createArtist");
            }}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
            }
          >
            + Create Artist
          </button>
        </div>
      ) : (
        <div className="min-h-full">
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%]  mt-10">
            View and manage all your artist profiles. Edit details, link
            streaming platforms, and track performance.
          </p>
          <div className="flex justify-between w-full mt-10 items-center">
            <div className="flex p-2 outline-1 m-2 rounded-lg mb-5 max-w-[60%] w-full">
              <Image
                priority={true}
                src="/search-normal.svg"
                alt="search icon"
                width={20}
                height={20}
              />
              <input
                type="search"
                className="w-full p-1 text-[16px] sm:text-sm outline-0"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
              />
            </div>
            <button
              disabled={isLoading || isFetching}
              aria-label="open filters button"
              className={
                "border-2 w-[50px]  h-[50px] rounded-lg flex flex-col justify-center items-center gap-1 relative " +
                (isFetching && " hover:!cursor-not-allowed ")
              }
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setSelectedIndex(null);
              }}
            >
              <div className="bg-primary w-[25px] h-[2px]"></div>
              <div className="bg-primary w-[15px] h-[2px]"></div>
              <div className="bg-primary w-[10px] h-[2px]"></div>
            </button>
            {isFilterOpen && (
              <div className="p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-40 flex flex-col gap-2">
                {filterOptions.map((options, index) => (
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
          <div className="grid grid-rows-2 grid-cols-2 gap-5 max-md:grid-cols-1 md:max-h-[400px]">
            {
              // artistCard
              data &&
                data.data.map((artist, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 border-2 border-neutral-100 rounded-lg p-2 flex gap-5 row-span-1 col-span-1 min-h-[100px] max-h-[110px] relative "
                  >
                    <div className="relative max-w-[100px] max-h-[100px] w-full h-full">
                      <Image
                        priority={true}
                        src={artist.artistImage}
                        alt="an image depicting no artist profile"
                        fill
                        className="object-contain rounded-lg shadow-md max-h-[80px] "
                      />
                    </div>
                    <h1 className="text-xl font-normal leading-[24px] tracking-[-0.5px] text-text-body w-full line-clamp-2">
                      {artist.artistName}
                    </h1>
                    <button
                      onClick={() => handleArtistOptionChange(index)}
                      aria-label={artist.artistName + " options"}
                      className="flex gap-1 border-2 border-neutral-200 rounded-lg max-h-[30px] min-h-[32px] max-w-[32px] min-w-[32px] items-center justify-center ml-auto"
                    >
                      <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                      <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                      <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                    </button>
                    {/* this is for the viewArtist button options */}
                    <div
                      className={
                        "divide-y divide-zinc-200 p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-0 flex-col gap-2" +
                        (selectedIndex === index ? " flex" : " hidden")
                      }
                    >
                      {artistOptions.map((options, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (options.name === "Stats") setViewStats(artist);
                            else setViewArtist(artist);
                            setSelectedIndex(null);
                          }}
                          name={options.name}
                          aria-label={options.name}
                          className=" flex items-center gap-2"
                        >
                          {" "}
                          {options.icon}
                          {options.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
            }
          </div>
          <div>
            <Pagination
              currentPage={page}
              totalPages={data ? data.totalPages : 0}
              onChange={(page) => setPage(page)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageArtist;
