"use client";
import { SelectDate } from "@/app/components/datepicker/SelectDate";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { royaltySource } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useGetAdminSalesReportDashboardDetails } from "@/util/customHooks/useQueries";
import { formatAmount } from "@/util/middleware/functions";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Clock4, FileChartLine, Music4, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const api = UseAxios();
  const queryClient = useQueryClient();
  const dashboardContext = useContext(DashboardContext);
  const [showUploadSalesReportModal, setshowUploadSalesReportModal] =
    useState(false);
  const [salesReportForm, setsalesReportForm] = useState<{
    royalty_source: string;
    accounting_period: undefined | Date;
    sales_period: undefined | Date;
    sales_report: null | File;
  }>({
    royalty_source: "",
    accounting_period: undefined,
    sales_period: undefined,
    sales_report: null,
  });
  const [isSubmitting, setisSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Sales Report");
  }, []);

  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetAdminSalesReportDashboardDetails();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    const files = e.target.files;
    if (name === "sales_report") {
      const file = files && files.length ? files[0] : null;
      if (file) {
        setsalesReportForm((prev) => ({ ...prev, sales_report: file }));
        setImage(URL.createObjectURL(file));
      }
    } else {
      setsalesReportForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitSalesReport = async () => {
    try {
      setisSubmitting(true);
      const formData = new FormData();
      Object.entries(salesReportForm).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, String(value));
        }
      });
      const res = await api.post("admin/finance/sales-report", formData, {
        headers: { "Content-Type": "multipart/formdata" },
      });
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({
        queryKey: ["salesReportDashboard"],
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
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
      {isLoading || !data ? (
        <InlineLoadingScreen />
      ) : (
        <div className="mt-5 flex flex-col gap-5 mb-10">
          <div className="flex justify-between items-center max-sm:flex-wrap">
            <button
              onClick={() => {
                setshowUploadSalesReportModal(true);
              }}
              className={
                "font-bold py-2 items-center rounded-lg gap-2 px-4 h-fit hover:bg-primary/90 border-2 text-white! border-primary flex bg-primary-500 text-xs max-sm:w-fit"
              }
            >
              <FileChartLine strokeWidth={1} size={20} />
              Upload Sales Report Data
            </button>
            <Link
            href="/dashboardAdmin/finance/sales-report/pending"
              className={
                "font-bold py-2 items-center mt-2 rounded-lg gap-2 px-2 h-fit hover:bg-primary/20 border-2 text-primary border-primary flex bg-transparent text-xs max-sm:w-fit"
              }
            >
              <Clock4 strokeWidth={1} size={20} />
              View Pending
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <div
              className={
                "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
                (isLoading && " shimmer")
              }
            >
              <div
                className={
                  "capitalize flex justify-between p-3 h-full " +
                  (isLoading && " hidden")
                }
              >
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="self-start w-auto h-auto"
                />
                <div className="mt4 flex flex-col gap-3">
                  <h2 className="text-base md:text-2xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                    {formatAmount(data.totals[0]?.totalNetAmount || 0)}
                  </h2>
                  <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] md:text-lg">
                    Total Revenue Uploaded
                  </p>
                </div>
              </div>
            </div>
            <div
              className={
                "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
                (isLoading && " shimmer")
              }
            >
              <div
                className={
                  "capitalize flex justify-between p-3 h-full " +
                  (isLoading && " hidden")
                }
              >
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="self-start w-auto h-auto"
                />
                <div className="mt4 flex flex-col gap-3">
                  <h2 className="text-base md:text-2xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                    {formatAmount(data.totalWithdrawn[0]?.totalWithdrawals || 0)}
                  </h2>
                  <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] md:text-lg">
                    Total Revenue Withdrawn
                  </p>
                </div>
              </div>
            </div>

            <div
              className={
                "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
                (isLoading && " shimmer")
              }
            >
              <div
                className={
                  "capitalize flex justify-between p-3 h-full " +
                  (isLoading && " hidden")
                }
              >
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="self-start w-auto h-auto"
                />
                <div className="mt4 self-end">
                  <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] md:text-lg">
                    Total Uploads
                  </p>
                  <h2 className="text-base md:text-2xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                    {data.totals[0]?.totalDocuments || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-5 max-sm:flex-col">
            <div className="flex-1 flex flex-col gap-5">
              <div className="bg-neutral-50 border-1 border-neutral-100 rounded-2xl">
                <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                  <Users color="#103958" />
                  Top Performing Label
                </p>
                <div className="grid grid-cols-3 max-md:grid-cols-2 items-center place-items-center">
                  {data.topLabels && data.topLabels.map((item, index) => (
                    <div
                      key={index}
                      className={
                        "flex justify-center items-center flex-col " +
                        (index == 2 && " max-md:col-span-2")
                      }
                    >
                      <div className="min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] relative">
                        <Image
                          priority={true}
                          loading="eager"
                          src={item.label.labelLogo ?? "/radio.png"}
                          alt="Profile picture"
                          fill
                          className="object-cover rounded-full "
                        />
                      </div>
                      <p
                        className={
                          "font-semibold text-xl flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5 text-center! "
                        }
                      >
                        {item.label.labelName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-50 border-1 border-neutral-100 rounded-2xl">
                <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                  <Users color="#103958" />
                  Top Performing Artists
                </p>
                <div className="grid grid-cols-3 max-md:grid-cols-2 items-center place-items-center">
                  {data.topArtists && data.topArtists.map((item, index) => (
                    <div
                      key={index}
                      className={
                        "flex justify-center items-center flex-col " +
                        (index == 2 && " max-md:col-span-2")
                      }
                    >
                      <div className="min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] relative">
                        <Image
                          priority={true}
                          loading="eager"
                          src={item.artist.artistImage ?? "/radio.png"}
                          alt="Profile picture"
                          fill
                          className="object-cover rounded-full "
                        />
                      </div>
                      <p
                        className={
                          "font-semibold text-xl flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5 text-center! "
                        }
                      >
                        {item.artist.artistName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 border-1 border-neutral-100 rounded-2xl">
              <p className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500 p-5">
                <Music4 color="#103958" />
                Top Performing Songs
              </p>
              <div className="p-5 flex flex-col gap-5">
                {data.topSongs && data.topSongs.map((item, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 border-2 border-neutral-100 rounded-lg flex gap-3 h-fit relative "
                  >
                    <div className="relative max-w-[100px] max-h-[100px] w-[100px] h-[100px] flex-2">
                      <Image
                        priority={true}
                        src={item.song.releaseImage ?? "/signinimage.png"}
                        alt="an image depicting the song image"
                        fill
                        className="object-cover rounded-lg shadow-md max-h-[80px] "
                      />
                    </div>
                    <div className="flex flex-col flex-2">
                      <h1 className="text-lg font-normal leading-[24px] tracking-[-0.5px] text-text-body w-full line-clamp-1">
                        {item.song.releaseTitle}
                      </h1>
                      <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm line-clamp-2">
                        feat. {item.song.featuredArtist[0].artistName}
                      </p>
                      <p className="mt-2">
                        <span className="text-primary-500 font-bold leading-[18px] tracking-tighter text-sm">
                          Revenue:{" "}
                        </span>
                        ${item.totalRevenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showUploadSalesReportModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[40]">
          {isSubmitting ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl md:w-[700px] shadow-2xl h-fit">
              {/* Reject Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 mt-5">
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Data
                </h3>
                <button
                  onClick={() => {
                    setshowUploadSalesReportModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reject Modal Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Upload royalty file from each source one at a time
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Select Royalty Source
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
                        selected={salesReportForm.royalty_source}
                        setSelected={(t) =>
                          setsalesReportForm((prev) => ({
                            ...prev,
                            royalty_source: t,
                          }))
                        }
                        placeholder="Select"
                        options={royaltySource}
                        name="rejectOption"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Accounting Period
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
                      <SelectDate
                        disabled={false}
                        setDate={(date) =>
                          setsalesReportForm((prev) => ({
                            ...prev,
                            accounting_period: date,
                          }))
                        }
                        value={salesReportForm.accounting_period}
                        type="first"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Sales Period
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
                      <SelectDate
                        disabled={false}
                        setDate={(date) =>
                          setsalesReportForm((prev) => ({
                            ...prev,
                            sales_period: date,
                          }))
                        }
                        value={salesReportForm.sales_period}
                        type="first"
                      />
                    </div>
                  </div>
                </div>

                {/* upload music */}
                <div>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                    <div className="flex flex-col w-[40%] max-sm:w-full gap-2 items-center justify-center">
                      <label
                        htmlFor="sales_report"
                        className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  dark:bg-gray-700 hover:bg-gray-100 dark:hover:border-gray-500"
                      >
                        <div className="w-[50%] flex max-w-[50%] items-center justify-center p-3 rounded-2xl bg-neutral-50 text-white">
                          <Image
                            src={"/file.svg"}
                            width={60}
                            height={60}
                            alt="music note icon"
                          />
                        </div>
                        <div className="w-[50%]">
                          {!salesReportForm.sales_report ? (
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-bold text-text-body">
                                Supported Files:
                              </span>{" "}
                              CSV,XLSX
                            </p>
                          ) : (
                            <p className="font-bold text-[16px] text-[#494949] truncate max-w-[50%]">
                              <span className="font-semibold truncate">
                                {salesReportForm.sales_report?.name}
                              </span>
                            </p>
                          )}
                        </div>
                        <input
                          id="sales_report"
                          name="sales_report"
                          type="file"
                          accept=".csv, text/csv, .xlsx"
                          className="hidden"
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {/* Reject Modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setshowUploadSalesReportModal(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSalesReport}
                    disabled={
                      !salesReportForm.accounting_period ||
                      !salesReportForm.royalty_source||!salesReportForm.sales_period ||!salesReportForm.sales_report
                    }
                    className="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-500/80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Upload
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
