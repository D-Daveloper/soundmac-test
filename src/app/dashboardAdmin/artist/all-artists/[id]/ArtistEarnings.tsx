"use client";
import React, { useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { Coins } from "lucide-react";
import { usePaginatedAdminArtistDetails } from "@/util/customHooks/useQueries";
import Link from "next/link";
import useDebounce from "@/app/components/searchBox/searchBox";
import Pagination from "@/app/components/pagination/Pagination";
import { allReleaseStatusFilterOptions } from "@/app/constant";
import ReleaseTable from "./releaseTableArtists";
import { formatAmount } from "@/util/middleware/functions";

export default function ArtistEarnings({ id }: { id: string }) {
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const releaseTitle = useDebounce<string>(query, 500);
  const [filter, setfilter] = useState({
    artist: "none",
    releaseStatusFilter: "all",
    sort: "",
  });
  if (!id) {
    return <InlineLoadingScreen />;
  }
  const { isLoading: isLoadingAllReleases, data: artistDetails } =
    usePaginatedAdminArtistDetails({
      ...filter,
      page,
      limit: "50",
      releaseTitle,
      id,
    });
  const handleSearchQueryChange = (filter: string) => {
    setPage(1);
    setQuery(filter);
    setfilter((prev) => ({ ...prev, releaseStatusFilter: "all" }));
  };
  return (
    <div className="w-full mt-10">
      {/* Filters */}
      <div className="w-full flex gap-5">
        <div className="flex p-1 outline-1 rounded-lg w-full max-w-[30%] h-fit ">
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
        <div className="flex ">
          {/* Wrapper with relative positioning */}
          <div className="relative pl-6">
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
                {allReleaseStatusFilterOptions.map((options, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setfilter((prev) => ({
                        ...prev,
                        releaseStatusFilter: options.value,
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
                        (filter.releaseStatusFilter != options.value &&
                          " opacity-0")
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
      <div className="bg-warning-50 flex flex-col w-full max-w-1/2 mt-10 gap-5 p-5 rounded-2xl h-fit">
        <h1 className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500">
          <Coins color="#103958" /> Total Earnings
        </h1>
        <p className="font-bold leading-[60px] -tracking-widest text-4xl text-primary-500">
          {artistDetails && formatAmount(artistDetails.totalRevenue)}
        </p>
      </div>
      {!artistDetails || artistDetails.data.length < 1 ? (
        <div className="flex flex-col justify-center items-center h-[80dvh] gap-15 ">
          <div>
            <Image
              priority={true}
              src={"/manage_song_image.png"}
              alt="an image depicting no artist profile"
              width={100}
              height={100}
            />
          </div>
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
            No Release.
          </p>
          <Link
            href={"/dashboardAdmin/music/all-releases/album"}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
            }
          >
            Go To Albums
          </Link>
        </div>
      ) : (
        <div className="mt-5 flex flex-col mb-10">
          <ReleaseTable
            releases={artistDetails.data}
            isfetching={isLoadingAllReleases}
          />
          {/* Pagination */}
          <div className="px-6">
            <div className="border-t pb-4 px-3 border-gray-200 rounded-lg bg-white flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * artistDetails.limit + 1} to{" "}
                {Math.min(
                  (page - 1) * artistDetails.limit + artistDetails.limit,
                  artistDetails.totalCount,
                )}{" "}
                of {artistDetails.totalCount} results
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={artistDetails.totalPages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
