"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { usePaginatedAdminAllUsers } from "@/util/customHooks/useQueries";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import useDebounce from "@/app/components/searchBox/searchBox";
import Pagination from "@/app/components/pagination/Pagination";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import AllUsersTable from "./AllUsersTable";
import { allUsersFilterOptions } from "@/app/constant";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const userStatus = getParam("userStatus");

  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const name = useDebounce<string>(query, 500);
  const [filter, setfilter] = useState({
    accountType: "all",
  });

  const {
    isLoading: isLoadingallUsers,
    data: allUsers,
    isFetching: isFetchingallUsers,
    isPending: isPendingallUsers,
    isRefetching: isRefetchingallUsers,
    isError: isErrorallUsers,
  } = usePaginatedAdminAllUsers({
    ...filter,
    sort: "",
    userStatus: userStatus || "active",
    page,
    limit: "50",
    name,
  });

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("All Users");
  }, []);

  useEffect(() => {
    if (!userStatus || (userStatus != "active" && userStatus != "inactive")) {
      setParam("userStatus", "active");
    }
  }, [userStatus]);

  const handleSearchQueryChange = (filter: string) => {
    setPage(1);
    setQuery(filter);
    setfilter((prev) => ({ ...prev, accountType: "all" }));
  };
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setParam("userStatus", "active");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (userStatus === "active"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Active
        </button>
        <button
          onClick={() => {
            setParam("userStatus", "inactive");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (userStatus === "inactive"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Deactivated
        </button>
      </div>
      {isLoadingallUsers ? (
        <InlineLoadingScreen />
      ) : (
        <>
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
                  <div className="p-3 absolute top-[calc(100%+8px)] right-0 w-fit bg-white border border-gray-200 rounded-lg shadow-lg z-40 transition-all duration-200 ease-in-out text-sm flex flex-col gap-2">
                    {allUsersFilterOptions.map((options, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setfilter((prev) => ({
                            ...prev,
                            accountType: options.value,
                          }));
                          setisFilterOpen(false);
                        }}
                        name={options.label}
                        aria-label={options.label}
                        className="flex items-center  text-nowrap gap-2 hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <div
                          className={
                            "w-2 h-2 rounded-full bg-primary " +
                            (filter.accountType != options.value &&
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

          {!allUsers || allUsers.data.length < 1 ? (
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
                There are no {userStatus == "active" ? "active" : "Deactivated"}{" "}
                Users Right Now.
              </p>
              <button
                onClick={() => {
                  if (userStatus == "active") {
                    setParam("userStatus", "inactive");
                  } else {
                    setParam("userStatus", "active");
                  }
                }}
                className={
                  "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                }
              >
                {userStatus == "active" ? "Go to Deactivated" : "Go to Active"}
              </button>
            </div>
          ) : (
            <div className="mt-5 flex flex-col mb-10">
              <AllUsersTable
                users={allUsers.data}
                isfetching={isFetchingallUsers}
              />
              {/* Pagination */}
              <div className="px-6">
                <div className="border-t pb-4 px-3 border-gray-200 rounded-lg bg-white flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * allUsers.limit + 1} to{" "}
                    {Math.min(
                      (page - 1) * allUsers.limit + allUsers.limit,
                      allUsers.totalCount,
                    )}{" "}
                    of {allUsers.totalCount} results
                  </div>
                  <div>
                    <Pagination
                      currentPage={page}
                      totalPages={allUsers.totalPages}
                      onChange={(page) => setPage(page)}
                    />
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
