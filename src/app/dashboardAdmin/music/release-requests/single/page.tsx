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
    dashboardContext?.setLayoutHeaderMessage("release Requests");
  }, []);

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
  };
  const {
    data: releaseRequests,
    isFetching: isFetchingReleaseRequests,
    isFetchingNextPage,
    // isRefetching:isRefecthingreleaseRequests,
    isError: isWithdrawalError,
    hasNextPage,
    status,
    fetchNextPage,
  } = useReleaseRequests({
    releaseType:"single",
    releaseTitle,
    limit: "50",
  });
  return (
    <div className="bg-main-white max-h-screen w-full flex flex-col lg:pl-[260px] px-5 overflow-hidden">
      <div className="flex gap-3 mt-5">
        <Link
          href={"/dashboardAdmin/music/release-requests/single"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
          }
        >
          Songs
        </Link>
        <Link
          href={"/dashboardAdmin/music/release-requests/album"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-transparent border-2 border-text-disable text-text-disable"
          }
        >
          Albums
        </Link>
      </div>
      {/* Filters */}
      <div className="flex p-1 outline-1 rounded-lg w-full max-w-[40%] max-h-fit mt-5 ">
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
      {status === "pending" || !releaseRequests ? (
        <InlineLoadingScreen />
      ) : (
        <>
          {releaseRequests.pages[0].data.length < 1 ? (
            <div className="flex flex-col justify-center items-center h-[80dvh] gap-15 ">
              <div>
                <Image
                  priority={true}
                  src={"/manage_song_image.png"}
                  alt="an image depicting no request releases"
                  width={100}
                  height={100}
                />
              </div>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
                There are no Requested Releases, Right Now.
              </p>
              <Link
                href={"/dashboardAdmin/music/release-requests/album"}
                className={
                  "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                }
              >
                Go to Albums
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5 mb-10">
              <div className="flex flex-col gap-5 h-[500px] overflow-y-auto p-5">
                {releaseRequests.pages.map((item, index) =>
                  item.data.map((release, idx) => (
                    <Link
                    href={"/dashboardAdmin/music/release-requests/single/"+release._id}
                      key={idx}
                      className="bg-warning-50 border border-neutral-100 p-3 rounded-lg flex justify-between"
                    >
                      <div className="flex gap-2">
                        <div className="relative w-30 h-30 max-w-30 max-h-30">
                          {/* <Image
                            priority={true}
                            src={release.releaseImage}
                            alt="release Image"
                            fill
                            className="rounded-lg object-cover"
                          /> */}
                        </div>
                        <div>
                          <h1 className="text-2xl font-normal leading-[30px] tracking-tighter text-main-heading">
                            {release.releaseTitle}
                          </h1>
                          <div className="flex gap-2 border border-neutral-100 rounded-lg items-center p-2 w-fit">
                            <div className="relative w-10 h-10 max-w-10 max-h-10">
                              {/* <Image
                                priority={true}
                                src={release.artist.artistImage}
                                alt="artist Image"
                                fill
                                className="rounded-lg object-cover"
                              /> */}
                            </div>
                            <h2 className="text-sm font-bold leading-[18px] tracking-tighter text-text-body">
                              {release.artist.artistName}
                            </h2>
                          </div>
                        </div>
                      </div>
                      <div className="bg-secondary-50 py-6 px-3 text-center rounded-lg flex flex-col justify-center ">
                        <p className="text-md font-normal leading-[20px] tracking-tighter text-text-disable">
                          Proposed Release Date:
                        </p>
                        <p className="text-primary-500 text-xl font-bold leading-[24px] tracking-tighter">
                          {new Date(release.releaseDate).toDateString()}
                        </p>
                      </div>
                    </Link>
                  )),
                )}
                <div className="flex justify-center">
                  <button
                    className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
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
