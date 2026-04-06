"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import useDebounce from "@/app/components/searchBox/searchBox";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetAllLabels } from "@/util/customHooks/useQueries";
import { useTabQuery } from "@/util/customHooks/useTabQuery";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const labelStatus = getParam("labelStatus");
  const [query, setQuery] = useState("");
  const labelName = useDebounce<string>(query, 500);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("all labels");
  }, []);

  useEffect(() => {
    if (
      !labelStatus ||
      (labelStatus != "active" && labelStatus != "inactive")
    ) {
      setParam("labelStatus", "active");
    }
  }, [labelStatus]);

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
  };
  const {
    data: allLabels,
    isFetching: isFetchingallLabels,
    isFetchingNextPage,
    // isRefetching:isRefecthinglabelRequests,
    isError: isWithdrawalError,
    hasNextPage,
    status,
    fetchNextPage,
  } = useGetAllLabels({
    labelStatus: labelStatus || "active",
    labelName,
    limit: "50",
  });

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5 overflow-hidden">
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setParam("labelStatus", "active");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (labelStatus === "active"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Active
        </button>
        <button
          onClick={() => {
            setParam("labelStatus", "inactive");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (labelStatus === "inactive"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Deactivated
        </button>
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
      {status === "pending" || !allLabels ? (
        <InlineLoadingScreen />
      ) : (
        <>
          {allLabels.pages[0].data.length < 1 ? (
            <div className="flex flex-col justify-center items-center h-[80dvh] gap-15 ">
              <div>
                <Image
                  priority={true}
                  src={"/manage_song_image.png"}
                  alt="an image depicting no request labels"
                  width={100}
                  height={100}
                />
              </div>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
                There are no {labelStatus == "active" ? "active":"Deactivated"} Labels Right Now.
              </p>
              <button
                onClick={() => {
                  if (labelStatus == "active") {
                    setParam("labelStatus", "inactive");
                  }
                  else{
                    setParam("labelStatus", "active");
                  }
                }}
                className={
                  "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                }
              >
                {labelStatus == "active" ? "Go to Deactivated" : "Go to Active"}
              </button>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5 mb-10">
              <div className="flex flex-col gap-5 h-[500px] overflow-y-auto p-5">
                {allLabels.pages.map((item, index) =>
                  item.data.map((label, idx) => (
                    <Link
                      href={"/dashboardAdmin/artist/all-labels/" + label._id}
                      key={idx}
                      className="bg-neutral-50 border border-neutral-100 p-3 rounded-lg flex justify-between"
                    >
                      <div className="flex gap-2">
                        <div className="relative w-20 h-20 max-w-20 max-h-20">
                          <Image
                            priority={true}
                            src={label.labelLogo}
                            alt="label Logo"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <h1 className="text-2xl font-normal leading-[30px] tracking-tighter text-main-heading">
                            {label.labelName}
                          </h1>
                          <h2 className="text-sm font-bold leading-[18px] tracking-tighter text-primary-500">
                            {label.artistCount} Artists
                          </h2>
                        </div>
                      </div>
                      <div className="bg-primary-50/99 py-1 px-3 text-center rounded-lg flex gap-3 ">
                        <div className="relative w-10 h-10 max-w-10 max-h-10">
                          <Image
                            priority={true}
                            src={label.labelLogo}
                            alt="artist Image"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-md font-bold leading-[20px] tracking-tighter text-black">
                            {label.user.lastName +
                              " " +
                              label.user.firstName}
                          </p>
                          <p className="text-black text-sm font-light leading-[18px] tracking-tighter">
                            {label.user.email}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )),
                )}
                <div className="flex justify-center">
                  <button
                    className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingallLabels}
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
