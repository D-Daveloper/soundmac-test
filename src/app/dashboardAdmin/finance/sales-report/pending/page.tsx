"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useGetPaginatedUnmatchedSalesReport } from "@/util/customHooks/useQueries";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import useDebounce from "@/app/components/searchBox/searchBox";
import { allPromotionsFilterOptions } from "@/app/constant";
import Pagination from "@/app/components/pagination/Pagination";
import Link from "next/link";
import PendingSalesReportTable from "./PendingSalesReportTable";
import { X } from "lucide-react";
import UseAxios from "@/util/customHooks/UseAxios";
import { useQueryClient } from "@tanstack/react-query";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Input from "@/app/components/input/Input";
import Select from "@/components/Select";
import { matchParameter, royaltySource } from "@/app/utils/constants";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

const Page = () => {
  const api = UseAxios();
  const queryClient = useQueryClient();
  const [isSubmitting, setisSubmitting] = useState(false);
  const dashboardContext = useContext(DashboardContext);
  const [showMatchUserFormModal, setshowMatchUserFormModal] = useState(false);
  const [page, setPage] = useState(1);
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [filter, setfilter] = useState({
    productType: "all",
  });
  const [query, setQuery] = useState("");
  const releaseTitle = useDebounce<string>(query, 500);
  const [matchUserForm, setmatchUserForm] = useState<{
    matchParameter: string;
    matchValue: string;
    productType: string;
  }>({
    matchParameter: "",
    matchValue: "",
    productType: "",
  });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("All UnMatched Sales");
  }, [dashboardContext]);

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
  };
  const {
    isLoading: isLoading,
    data: allSalesReport,
    isFetching: isFetchingAllReleases,
    isPending: isPendingAllReleases,
    isRefetching: isRefetchingAllReleases,
    isError: isErrorAllReleases,
  } = useGetPaginatedUnmatchedSalesReport({
    ...filter,
    page,
    limit: "50",
    releaseTitle,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;

    setmatchUserForm((prev) => ({ ...prev, [name]: value }));
  };
    const handleSubmitMatchUserForm = async () => {
      try {
        setisSubmitting(true);

        const res = await api.post("admin/finance/sales-report/pending", matchUserForm, {
          headers: { "Content-Type": "application/json" },
        });
        console.log(res.data);
        toast.success(res.data.msg);
        await queryClient.invalidateQueries({
          queryKey: ["unmatchedSalesReport"],
        });
      } catch (error) {
        if (isAxiosError(error)) {
          console.log(error);
          return;
        }
        toast.error("Something went wrong!");
      } finally {
        setisSubmitting(false);
      }
    };
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col gap-10 lg:pl-[260px] px-2 md:px-5 overflow-hidden">
      <Link
        href={"/dashboardAdmin/finance/sales-report"}
        aria-label="go back"
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary! text-2xl rounded-full shadow-2xl shadow-black my-2"
      >
        <Image
          src={"/arrow-left.svg"}
          height={32}
          width={32}
          alt="arrow left"
        />
      </Link>
      {/* Filters */}
      <div className="w-full flex flex-col md:flex-row flex-wrap justify-between gap-5 items-end">
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
                        (filter.productType != options.value && " opacity-0")
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
      <div className="grid grid-cols-1 gap-5 w-full h-full">

        {/* total earnings */}
        <div
          className={
            "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[200px] w-full col-span-[1.25] " +
            (isLoading && " shimmer")
          }
        >
          <div
            className={
              "capitalize flex flex-col gap-3 h-full justify-between " +
              (isLoading && " hidden")
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
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                Total Revenue
              </p>
              <h2 className="text-2xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end truncate">
                ${allSalesReport?.totalRevenue || 0}
              </h2>
            </div>
          </div>
        </div>
      </div>
      {!allSalesReport || allSalesReport.data.length < 1 ? (
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
            No Unmatched Sales report
          </p>
          <Link
            href={"/dashboardAdmin/finance/sales-report"}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
            }
          >
            Go Sales Report
          </Link>
        </div>
      ) : (
        // button for matching using user
        <div className="mt-2 flex flex-col mb-10">
          <div className="flex justify-between items-center max-sm:flex-wrap">
            <button
              onClick={() => {
                setshowMatchUserFormModal(true);
              }}
              className={
                "font-bold py-2 items-center rounded-lg gap-2 px-4 h-fit hover:bg-primary/90 border-2 text-white! border-primary flex bg-primary-500 text-xs max-sm:w-fit"
              }
            >
              {/* <FileChartLine strokeWidth={1} size={20} /> */}
              Match User
            </button>
          </div>
          <PendingSalesReportTable
            salesReport={allSalesReport.data}
            isfetching={isLoading}
          />
          {/* Pagination */}
          <div className="px-6">
            <div className="border-t pb-4 px-3 border-gray-200 rounded-lg bg-white flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * allSalesReport.limit + 1} to{" "}
                {Math.min(
                  (page - 1) * allSalesReport.limit + allSalesReport.limit,
                  allSalesReport.totalCount,
                )}{" "}
                of {allSalesReport.totalCount} results
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={allSalesReport.totalPages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {showMatchUserFormModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[40]">
          {isSubmitting ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
              {/* Reject Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Match User Data
                </h3>
                <button
                  onClick={() => {
                    setshowMatchUserFormModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 w-full flex flex-wrap justify-between gap-y-10 ">
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <div className="flex gap-1">
                    <p className="font-medium mb-2 sm:text-sm text-lg">
                      Select the Product Type
                    </p>
                    <Image
                      priority={false}
                      loading="lazy"
                      src="/required.svg"
                      alt="a star marking this field as required"
                      width={0}
                      height={0}
                      className="w-2 -mt-5"
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      selected={matchUserForm.productType}
                      setSelected={(t) =>
                        setmatchUserForm((prev) => ({
                          ...prev,
                          productType: t,
                        }))
                      }
                      placeholder="Select"
                      options={["single","album"]}
                      name="rejectOption"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <div className="flex gap-1">
                    <p className="font-medium mb-2 sm:text-sm text-lg">
                      Select the matching parameter
                    </p>
                    <Image
                      priority={false}
                      loading="lazy"
                      src="/required.svg"
                      alt="a star marking this field as required"
                      width={0}
                      height={0}
                      className="w-2 -mt-5"
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      selected={matchUserForm.matchParameter}
                      setSelected={(t) =>
                        setmatchUserForm((prev) => ({
                          ...prev,
                          matchParameter: t,
                        }))
                      }
                      placeholder="Select"
                      options={matchParameter}
                      name="rejectOption"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={matchUserForm.matchValue}
                    title={"Value"}
                    type={"text"}
                    name={"matchValue"}
                    placeholder={"Enter the value"}
                    updateValue={handleChange}
                    required={true}
                  />
                </div>
              </div>
              {/* Reject Modal Content */}
              <div className="p-6">
                {/* Reject Modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setshowMatchUserFormModal(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitMatchUserForm}
                    disabled={
                      !matchUserForm.matchParameter || !matchUserForm.matchValue || !matchUserForm.productType
                    }
                    className="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-500/80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
