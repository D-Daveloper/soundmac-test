"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Select from "@/components/Select";
import {
  useAuthUser,
  useGetUserArtistsNames,
  useWithdrawals,
} from "@/util/customHooks/useQueries";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import WithdrawalLine from "./withdrawalLine";
import {
  periodFilterOptions,
  withdrawalStatusFilterOptions,
} from "@/app/constant";

const page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [filter, setfilter] = useState({
    period: { label: "All Time", value: "all" },
    artist: "",
    withdrawalStatusFilter: "all",
    sort: "",
  });
  const { isLoading, data } = useAuthUser();
  const {
    isLoading: isLoadingArtistNames,
    data: artistNames,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetUserArtistsNames();
  const {
    data: withdrawals,
    isFetching: isFetchingWithdrawals,
    isFetchingNextPage,
    // isRefetching:isRefecthingWithdrawals,
    isError: isWithdrawalError,
    hasNextPage,
    status,
    fetchNextPage,
  } = useWithdrawals({
    withdrawalStatusFilter: filter.withdrawalStatusFilter,
    sort: filter.sort,
    period: filter.period.value,
  });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Withdrawal History");
  }, []);

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[310px] px-5">
      <Link
        aria-label="go back"
        href={"/dashboard/finance/salesReport"}
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary text-2xl rounded-full shadow-2xl shadow-black my-2"
      >
        <Image
          src={"/arrow-left.svg"}
          height={32}
          width={32}
          alt="arrow left"
        />
      </Link>

      {isLoading ||
      !data ||
      isLoadingArtistNames ||
      !artistNames ||
      status === "pending" ||
      !withdrawals ? (
        <InlineLoadingScreen />
      ) : (
        <>
          {/* Filters */}
          <div className="w-full flex flex-wrap justify-between gap-5 mb-5">
            <div className="flex flex-col w-[40%] max-sm:w-full gap-2 flex-1">
              <p className="font-medium mb-2 sm:text-sm text-lg">Period</p>
              <div className="w-full">
                <Select
                  selected={filter.period.label}
                  setSelected={(t) => {
                    const found = periodFilterOptions.find(
                      (item) => item.label === t,
                    );
                    if (found) {
                      setfilter((prev) => ({ ...prev, period: found }));
                    }
                  }}
                  placeholder="Select Artist..."
                  options={periodFilterOptions.map((item, index) => item.label)}
                  name="period"
                />
              </div>
            </div>
            <div className="flex flex-col w-[40%] max-sm:w-full gap-2 flex-1">
              <p className="font-medium mb-2 sm:text-sm text-lg">Artist</p>
              <div className="w-full">
                <Select
                  selected={filter.artist}
                  setSelected={(t) =>
                    setfilter((prev) => ({ ...prev, artist: t }))
                  }
                  placeholder="Select Artist..."
                  options={artistNames || []}
                  name="artist"
                />
              </div>
            </div>
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
                  <div className="p-3 absolute top-[calc(100%+8px)] right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out text-sm flex flex-col gap-2">
                    {withdrawalStatusFilterOptions.map((options, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setfilter((prev) => ({
                            ...prev,
                            withdrawalStatusFilter: options.value,
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
                            (filter.withdrawalStatusFilter != options.value &&
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

          {withdrawals?.pages[0].data.length < 1 ? (
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
                You haven't released any singles. Upload your first track to get
                started.
              </p>
              <Link
                href={"/dashboard/finance/salesReport"}
                className={
                  "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                }
              >
                Send a withdrawal Request
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5 mb-10">
              <div className="flex flex-col gap-3 w-full">
                {withdrawals?.pages.map((items, index) =>
                  items.data.map((item, idx) => (
                    <WithdrawalLine
                      key={idx}
                      status={item.withdrawalStatus}
                      account_number={item.accountNumber}
                      amount={item.amount}
                      date={new Date(item.createdAt).toDateString()}
                    />
                  )),
                )}
                <div className="flex justify-center">
                  <button
                    className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetching}
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

export default page;

// ```

// **Key fixes:**

// 1. **Wrapped everything after loading check in a Fragment (`<>...</>`)** - The ternary needed proper grouping
// 2. **Fixed the closing structure** - Your original code had the ternary condition but didn't properly wrap the "true" branch
// 3. **Fixed duplicate `index` variable** - Changed the inner map to use `idx` instead of `index` to avoid variable shadowing

// The structure is now:
// ```
// {condition ? (
//   <LoadingScreen />
// ) : (
//   <>
//     {/* Filters */}
//     {/* Withdrawals list or empty state */}
//   </>
// )}
