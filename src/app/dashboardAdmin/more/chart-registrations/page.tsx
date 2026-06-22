"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import {
    useGetPaginatedCharts,
} from "@/util/customHooks/useQueries";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import useDebounce from "@/app/components/searchBox/searchBox";
import { adminChartFilter } from "@/app/constant";
import Pagination from "@/app/components/pagination/Pagination";
import Link from "next/link";
import ChartTable from "./ChartTable";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const chartStatus = getParam("chartStatus");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [filter, setfilter] = useState({
    chartName: "all",
    sort: "",
  });
  const [query, setQuery] = useState("");
  const releaseTitle = useDebounce<string>(query, 500);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("All Charts");
  }, [dashboardContext]);

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
  };
  const {
    isLoading: isLoadingAllCharts,
    data: allCharts,
    isFetching: isFetchingAllReleases,
    isPending: isPendingAllReleases,
    isRefetching: isRefetchingAllReleases,
    isError: isErrorAllReleases,
  } = useGetPaginatedCharts({
    ...filter,
    page,
    limit: "50",
    releaseTitle,
    chartStatus: chartStatus || "all",
  });
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col gap-10 lg:pl-[260px] px-5 overflow-hidden">
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setParam("chartStatus", "all");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (chartStatus === "all"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          All
        </button>
        <button
          onClick={() => {
            setParam("chartStatus", "pending");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (chartStatus === "pending"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Pending
        </button>
        <button
          onClick={() => {
            setParam("chartStatus", "approved");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (chartStatus === "approved"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Approved
        </button>
      </div>
      {/* Filters */}
      <div className="w-full flex flex-wrap justify-between gap-5 items-end">
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
                {adminChartFilter.map((options, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setfilter((prev) => ({
                        ...prev,
                        chartName: options.value,
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
                        (filter.chartName != options.value && " opacity-0")
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

      {!allCharts || allCharts.data.length < 1 ? (
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
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center capitalize">
            No Chart Registrations found for the selected filters. Try adjusting your search or filters to find what you're looking for.
          </p>
          <Link
            href={"/dashboardAdmin/more/promotions?chartStatus=all"}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
            }
          >
            Go All
          </Link>
        </div>
      ) : (
        <div className="flex flex-col mb-10">
          <ChartTable
            charts={allCharts.data}
            isfetching={isLoadingAllCharts}
          />
          {/* Pagination */}
          <div className="px-6">
            <div className="border-t pb-4 px-3 border-gray-200 rounded-lg bg-white flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * allCharts.limit + 1} to{" "}
                {Math.min(
                  (page - 1) * allCharts.limit + allCharts.limit,
                  allCharts.totalCount,
                )}{" "}
                of {allCharts.totalCount} results
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={allCharts.totalPages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
