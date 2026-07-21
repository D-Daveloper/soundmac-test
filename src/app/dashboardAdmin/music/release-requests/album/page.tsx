"use client";

import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import useDebounce from "@/app/components/searchBox/searchBox";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReleaseRequests } from "@/util/customHooks/useQueries";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [query, setQuery] = useState("");
  const releaseTitle = useDebounce<string>(query, 500);

  useEffect(() => {
    dashboardContext?.setHeader({
      title: "Release Requests",
      showBackButton: false,
    });
  }, []);

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
  };

  const {
    data: releaseRequests,
    isFetching: isFetchingReleaseRequests,
    isFetchingNextPage,
    hasNextPage,
    status,
    fetchNextPage,
  } = useReleaseRequests({
    releaseTitle,
    releaseType: "album",
    limit: "50",
  });

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-4 sm:px-6 py-5 overflow-x-hidden">
      {/* Navigation Tabs */}
        <div className="flex gap-3 mt-5">
        <Link
          href={"/dashboardAdmin/music/release-requests/single"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-transparent border-2 border-text-disable text-text-disable"
          }
        >
          Songs
        </Link>
        <Link
          href={"/dashboardAdmin/music/release-requests/album"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
          }
        >
          Albums
        </Link>
      </div>
        

      {/* Filters / Search Bar */}
      <div className="flex items-center gap-2 p-2 outline-1 outline-neutral-200 rounded-lg w-full md:max-w-md mt-5 bg-white">
        <Image
          priority={true}
          src="/search-normal.svg"
          alt="search icon"
          width={20}
          height={20}
          className="w-5 h-5 flex-shrink-0"
        />
        <input
          name="search"
          value={query}
          type="search"
          className="w-full text-base sm:text-sm outline-none bg-transparent"
          onChange={(e) => handleSearchQueryChange(e.target.value)}
          placeholder="Search release title..."
        />
      </div>

      {/* Content Section */}
      {status === "pending" || !releaseRequests ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <InlineLoadingScreen />
        </div>
      ) : (
        <>
          {releaseRequests.pages[0]?.data?.length < 1 ? (
            /* Empty State */
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-6 text-center px-4">
              <div>
                <Image
                  priority={true}
                  src={"/manage_song_image.png"}
                  alt="No release requests found"
                  width={100}
                  height={100}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
              </div>
              <p className="text-text-body font-normal text-base max-w-sm">
                There are no Requested Releases right now.
              </p>
              <Link
                href={"/dashboardAdmin/music/release-requests/single"}
                className="font-bold text-sm rounded-lg px-5 py-2.5 hover:bg-primary/90 border-2 border-primary text-white bg-primary-500 transition-colors"
              >
                Go to Singles
              </Link>
            </div>
          ) : (
            /* Release Requests List */
            <div className="mt-5 flex flex-col gap-5 pb-10">
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
                {releaseRequests.pages.map((item) =>
                  item.data.map((release, idx) => (
                    <Link
                      href={
                        "/dashboardAdmin/music/release-requests/album/" +
                        release._id
                      }
                      key={release._id || idx}
                      className="bg-warning-50 border border-neutral-100 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-neutral-300"
                    >
                      {/* Left Block: Image & Details */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                          <Image
                            priority={true}
                            src={release.releaseImage}
                            alt="release cover"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>

                        <div className="flex flex-col gap-2 min-w-0">
                          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-main-heading truncate">
                            {release.releaseTitle}
                          </h1>

                          {/* Artist Pill */}
                          <div className="flex gap-2.5 border border-neutral-100 rounded-lg items-center p-1.5 w-fit bg-white/60">
                            <div className="relative w-8 h-8 flex-shrink-0">
                              <Image
                                priority={true}
                                src={release.artist.artistImage}
                                alt="artist profile"
                                fill
                                className="rounded-md object-cover"
                              />
                            </div>
                            <h2 className="text-xs sm:text-sm font-bold text-text-body truncate max-w-[150px] sm:max-w-[200px]">
                              {release.artist.artistName}
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Stats & Date */}
                      <div className="flex flex-row sm:flex-row md:flex-row gap-1 items-stretch justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200/60">
                        <div className="bg-primary-50 py-3 px-4 rounded-lg flex flex-col justify-center items-center min-w-[110px] text-center flex-1 md:flex-none">
                          <p className="text-primary-500 text-base sm:text-lg font-bold">
                            {release.numberOfTracks} track(s)
                          </p>
                        </div>

                        <div className="bg-secondary-50 py-3 px-4 rounded-lg flex flex-col justify-center items-center text-center flex-1 md:flex-none min-w-[150px]">
                          <p className="text-xs font-normal text-text-disable">
                            Proposed Release Date:
                          </p>
                          <p className="text-primary-500 text-sm sm:text-base font-bold">
                            {new Date(release.releaseDate).toDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}

                {/* Pagination Button */}
                <div className="flex justify-center mt-4">
                  <button
                    className="font-bold text-sm rounded-lg px-6 py-2.5 hover:bg-primary/90 border-2 border-primary text-white bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingReleaseRequests}
                  >
                    {isFetchingNextPage
                      ? "Loading more..."
                      : hasNextPage
                      ? "Load More"
                      : "Nothing more to load"}
                  </button>
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