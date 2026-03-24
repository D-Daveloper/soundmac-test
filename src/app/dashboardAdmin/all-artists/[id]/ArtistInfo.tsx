"use client";
import React, { useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { Copy } from "lucide-react";
import { usePaginatedAdminArtistDetails } from "@/util/customHooks/useQueries";
import Link from "next/link";
import { handleCopy } from "@/util/middleware/functions";
import useDebounce from "@/app/components/searchBox/searchBox";
import Pagination from "@/app/components/pagination/Pagination";
import { allReleaseStatusFilterOptions } from "@/app/constant";
import ReleaseTable from "./releaseTableArtists";

export default function ArtistInfo({ id }: { id: string }) {
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
      <div className="flex gap-5">
        <div
          className={
            "bg-neutral-50 p-3 rounded-lg flex-1 h-[250px] " +
            (isLoadingAllReleases && " shimmer")
          }
        >
          <div
            className={
              " flex flex-col justify-between h-full " +
              ((isLoadingAllReleases || !artistDetails) && "hidden")
            }
          >
            <div className="flex gap-3">
              <div className="relative w-20 h-20 max-w-20 max-h-20">
                <Image
                  priority={true}
                  src={"/signinimage.png"}
                  alt="release Image"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-light leading-[30px] tracking-tighter text-main-heading">
                  Kingsley & The Vibe Collective
                </h1>
                <p className="text-md font-semibold leading-[20px] tracking-tighter text-text-body">
                  Kingsley Okafor
                </p>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-success-800 font-bold leading-[18px] tracking-tighter text-xs">
                Active since {new Date().toDateString()}
              </p>
            </div>
          </div>
        </div>
        <div
          className={
            "bg-secondary-50 p-3 rounded-lg flex-1 h-[250px] " +
            (isLoadingAllReleases && " shimmer")
          }
        >
          <div
            className={
              "flex flex-col gap-3 justify-between h-full " +
              ((isLoadingAllReleases || !artistDetails) && "hidden")
            }
          >
            <div className="flex justify-between">
              <div className="flex flex-col gap-3">
                <h3 className="text-text-disable font-bold leading-[18px] tracking-tighter text-sm">
                  Spotify ID
                </h3>
                <button
                  value={artistDetails?.artist.spotifyId}
                  onClick={(e) => handleCopy(e.currentTarget.value)}
                  className="text-primary-500 font-normal leading-[18px] tracking-tighter text-2xl flex gap-3"
                >
                  {artistDetails?.artist.spotifyId}
                  <Copy color="#11456B" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-text-disable font-bold leading-[18px] tracking-tighter text-sm">
                  Apple Music ID
                </h3>
                <button
                  value={artistDetails?.artist.appleId}
                  onClick={(e) => handleCopy(e.currentTarget.value)}
                  className="text-primary-500 font-normal leading-[18px] tracking-tighter text-2xl flex gap-3"
                >
                  {artistDetails?.artist.appleId}
                  <Copy color="#11456B" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-20">
              <h3 className="text-text-disable font-bold leading-[18px] tracking-tighter text-sm">
                Artist Smartlink
              </h3>
              <button
                value={"www.smartlink/kingsleyandthe...tive.io"}
                onClick={(e) => handleCopy(e.currentTarget.value)}
                className="text-primary-500 font-normal leading-[18px] tracking-tighter text-2xl flex gap-3"
              >
                www.smartlink/kingsleyandthe...tive.io
                <Copy color="#11456B" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-medium mb-2 text-2xl pl-6">
          Artist&apos;s Releases
        </h2>
        {/* Filters */}
        <div className="w-full flex gap-5 pl-6 ">
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
              href={"/dashboardAdmin/all-releases/album"}
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
    </div>
  );
}
