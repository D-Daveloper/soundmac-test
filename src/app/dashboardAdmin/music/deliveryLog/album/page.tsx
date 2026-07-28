"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Select from "@/components/Select";
import { useGetAdminArtistsNames, usePaginatedDeliveryLog } from "@/util/customHooks/useQueries";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import DeliveryLogTable from "../deliveryLogTable";
import useDebounce from "@/app/components/searchBox/searchBox";
import Pagination from "@/app/components/pagination/Pagination";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const releaseTitle = useDebounce<string>(query, 500);
  const [artist, setArtist] = useState("none");

  const { isLoading: isLoadingArtistNames, data: artistNames } = useGetAdminArtistsNames();
  const { isLoading, data: deliveryLog, isFetching } = usePaginatedDeliveryLog({
    page,
    limit: "50",
    releaseTitle,
    artist,
    releaseType: "album",
  });

  useEffect(() => {
    dashboardContext?.setHeader({ title: "Delivery Log", showBackButton: true });
  }, []);

  const handleSearchQueryChange = (value: string) => {
    setPage(1);
    setQuery(value);
  };

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-2 md:px-5">
      <div className="flex gap-3 mt-5">
        <Link href={"/dashboardAdmin/music/deliveryLog/single"} className="px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!">
          Songs
        </Link>
        <Link href={"/dashboardAdmin/music/deliveryLog/album"} className="px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-transparent border-2 border-text-disable text-text-disable">
          Albums
        </Link>
      </div>

      {isLoading || isLoadingArtistNames || !artistNames ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="w-full flex flex-col md:flex-row justify-between gap-5 items-end mt-5">
            <div className="flex p-1 outline-1 rounded-lg w-full flex-1 max-w-[40%] h-fit">
              <Image priority={true} src="/search-normal.svg" alt="search icon" width={20} height={20} className="w-auto h-auto" />
              <input
                name="search"
                value={query}
                type="search"
                className="w-full p-1 text-[16px] sm:text-sm outline-0"
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                placeholder="Search"
              />
            </div>
            <div className="flex flex-col w-[40%] max-sm:w-full gap-1 flex-1">
              <p className="font-medium mb-2 sm:text-sm text-lg">Artist</p>
              <div className="w-full relative z-20">
                <Select
                  selected={artist}
                  setSelected={(t) => {
                    setPage(1);
                    setArtist(t);
                  }}
                  placeholder="Select Artist..."
                  options={["none", ...artistNames]}
                  name="artist"
                />
              </div>
            </div>
          </div>

          {!deliveryLog || deliveryLog.data.length < 1 ? (
            <div className="flex flex-col justify-center items-center h-[80dvh] gap-15">
              <div>
                <Image priority={true} src={"/manage_song_image.png"} alt="no approved releases" width={100} height={100} />
              </div>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
                No approved releases yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col mb-10">
              <DeliveryLogTable releases={deliveryLog.data} isfetching={isFetching} />
              <div className="px-0 md:px-2">
                <div className="border-t border-gray-200 py-4 px-2 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between rounded-lg">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * deliveryLog.limit + 1} to{" "}
                    {Math.min((page - 1) * deliveryLog.limit + deliveryLog.limit, deliveryLog.totalCount)} of {deliveryLog.totalCount} results
                  </div>
                  <div>
                    <Pagination currentPage={page} totalPages={deliveryLog.totalPages} onChange={(p) => setPage(p)} />
                  </div>
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