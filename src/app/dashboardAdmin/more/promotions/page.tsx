"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useGetPaginatedPromotions } from "@/util/customHooks/useQueries";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import useDebounce from "@/app/components/searchBox/searchBox";
import {
  allPromotionsFilterOptions,
  allUsersFilterOptions,
} from "@/app/constant";
import PromotionTable from "./promotionTable";
import Pagination from "@/app/components/pagination/Pagination";
import Link from "next/link";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const promotionStatus = getParam("promotionStatus");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [filter, setfilter] = useState({
    promotionType: "all",
    sort: "",
  });
  const [query, setQuery] = useState("");
  const releaseTitle = useDebounce<string>(query, 500);

  useEffect(() => {
    dashboardContext?.setHeader({title:"All Promotions", showBackButton:true});
  }, []);

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
  };
  const {
    isLoading: isLoadingAllPromotions,
    data: allPromotions,
    isFetching: isFetchingAllReleases,
    isPending: isPendingAllReleases,
    isRefetching: isRefetchingAllReleases,
    isError: isErrorAllReleases,
  } = useGetPaginatedPromotions({
    ...filter,
    page,
    limit: "50",
    releaseTitle,
    promotionStatus: promotionStatus || "all",
  });
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col gap-10 lg:pl-[260px] px-2 md:px-5 overflow-hidden">
      <div className="flex overflow-x-auto remove-scrollbar gap-3 mt-5">
        <button
          onClick={() => {
            setParam("promotionStatus", "all");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (promotionStatus === "all"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          All
        </button>
        <button
          onClick={() => {
            setParam("promotionStatus", "pending");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (promotionStatus === "pending"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Pending
        </button>
        <button
          onClick={() => {
            setParam("promotionStatus", "approved");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (promotionStatus === "approved"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Approved
        </button>
        <button
          onClick={() => {
            setParam("promotionStatus", "completed");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (promotionStatus === "completed"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Completed
        </button>
      </div>
      {/* Filters */}
      <div className="w-full flex flex-wrap justify-between gap-5 md:items-end">
        <div className="flex p-1 outline-1 rounded-lg md:w-[80%] h-fit ">
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
                {allPromotionsFilterOptions.map((options, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setfilter((prev) => ({
                        ...prev,
                        promotionType: options.value,
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
                        (filter.promotionType != options.value && " opacity-0")
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
      <div className="grid grid-cols-4 max-sm:grid-cols-1 gap-5 w-full h-full">
        <div
          className={
            " bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[200px] w-full col-span-2 " +
            (isLoadingAllPromotions && " shimmer")
          }
        >
          {/* total releases  */}
          <div
            className={
              "capitalize p-3 h-full " + (isLoadingAllPromotions && " hidden")
            }
          >
            <div className="flex flex-col justify-around h-full ">
              <div className="flex justify-between">
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className=" w-auto h-auto"
                />
                <h2 className="text-2xl font-bold leading-[40px] tracking-tighter text-text-body">
                  {allPromotions?.totalPromotions || "0"}
                </h2>
              </div>
              <p className="text-text-disable text-end font-normal leading-[20px] tracking-[-0.5px] text-lg">
                Total Promo Requests
              </p>
              <div className="flex gap-5 w-full">
                <div className="text-center border border-neutral-100 bg-success-50 rounded-lg w-full py-1">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-tighter text-main-heading">
                    {allPromotions?.totalBoomplay || 0}
                  </h3>
                  <p className="text-text-disable font-bold leading-[18px] tracking-[-0.5px] text-sm">
                    Boomplay Playlist
                  </p>
                </div>
                <div className="text-center border border-neutral-100 bg-warning-100 rounded-lg w-full py-1">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-tighter text-main-heading">
                    {allPromotions?.totalOnlinePress || 0}
                  </h3>
                  <p className="text-text-disable font-bold leading-[18px] tracking-[-0.5px] text-sm">
                    Online Press
                  </p>
                </div>
                <div className="text-center border border-neutral-100 bg-error-50 rounded-lg w-full py-1">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-tighter text-main-heading">
                    {allPromotions?.totalRadioPromotion || 0}
                  </h3>
                  <p className="text-text-disable font-bold leading-[18px] tracking-[-0.5px] text-sm">
                    Radio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* total users */}
        <div
          className={
            "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[200px] w-full col-span-[1.25] " +
            (isLoadingAllPromotions && " shimmer")
          }
        >
          <div
            className={
              "capitalize flex flex-col gap-3 h-full justify-start " +
              (isLoadingAllPromotions && " hidden")
            }
          >
            <div className="flex flex-col md:flex-row justify-between items-start h-fit">
              <Image
                src={"/people.svg"}
                priority={false}
                height={50}
                width={50}
                alt="people icon"
              />
              <h2 className="text-2xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit truncate">
                {allPromotions?.totalActivePromotions || 0}
              </h2>
            </div>
            <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-md w-full flex-1 text-end">
              Active Promos
            </p>
          </div>
        </div>

        {/* total earnings */}
        <div
          className={
            "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[200px] w-full col-span-[1.25] " +
            (isLoadingAllPromotions && " shimmer")
          }
        >
          <div
            className={
              "capitalize flex flex-col gap-3 h-full justify-between " +
              (isLoadingAllPromotions && " hidden")
            }
          >
            <Image
              src={"/money-icon.png"}
              priority={false}
              height={50}
              width={53}
              alt="money icon"
            />
            <div className="flex flex-col">
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter md:text-lg w-full flex-1 text-end">
                Total Revenue
              </p>
              <h2 className="text-base md:text-2xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end truncate">
                ₦{allPromotions?.totalPromotionsAmount || 0}
              </h2>
            </div>
          </div>
        </div>
      </div>
      {!allPromotions || allPromotions.data.length < 1 ? (
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
            No {promotionStatus} Promotions
          </p>
          <Link
            href={"/dashboardAdmin/more/promotions?promotionStatus=all"}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
            }
          >
            Go All
          </Link>
        </div>
      ) : (
        <div className="flex flex-col mb-10">
          <PromotionTable
            promotions={allPromotions.data}
            isfetching={isLoadingAllPromotions}
          />
          {/* Pagination */}
          <div className="px-0 md:px-2">
            <div className="border-t border-gray-200 py-4 px-2 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between rounded-lg">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * allPromotions.limit + 1} to{" "}
                {Math.min(
                  (page - 1) * allPromotions.limit + allPromotions.limit,
                  allPromotions.totalCount,
                )}{" "}
                of {allPromotions.totalCount} results
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={allPromotions.totalPages}
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
