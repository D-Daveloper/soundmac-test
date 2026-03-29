"use client";
import React, { use, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useGetAdminWithdrawaldetails } from "@/util/customHooks/useQueries";
import UseAxios from "@/util/customHooks/UseAxios";
import Link from "next/link";
import { CircleCheck, X } from "lucide-react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Select from "@/components/Select";
import { genreList } from "@/app/utils/constants";

export default function Page({
  params,
}: {
  params: Promise<{ withdrawalId: string }>;
}) {
  const queryClient = useQueryClient();
  const api = UseAxios();
  const dashboardContext = useContext(DashboardContext);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showConfirmWithdrawalRequest, setshowConfirmWithdrawalRequest] =
    useState(false);
  const [showRejectModal, setshowRejectModal] = useState(false);
  const [rejectWithdrawalForm, setrejectWithdrawalForm] = useState({
    reason: "",
    message: "",
  });
  const { withdrawalId } = use(params);
  if (!withdrawalId) {
    return <InlineLoadingScreen />;
  }
  const { isLoading: isLoadingWithdrawalDetails, data: withdrawalDetails } =
    useGetAdminWithdrawaldetails({ withdrawalId });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Withdrawal Details");
  }, []);
  console.log(withdrawalId);

  const handleApproveWithdrawal = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post(
        "admin/finance/withdrawal-requests/" + withdrawalId,
        {
          requestType: "approved",
        },
      );
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({
        queryKey: ["allWithdrawalRequests"],
      });
      if (withdrawalDetails) {
        withdrawalDetails.withdrawal.withdrawalStatus = "approved";
      }
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

  const handleRejectWithdrawal = async () => {
    try {
      setisSubmitting(true);
      if (
        !rejectWithdrawalForm ||
        !rejectWithdrawalForm.message.trim() ||
        !rejectWithdrawalForm.reason.trim()
      ) {
        return toast.warn("Please fill the form.");
      }
      const res = await api.post(
        "admin/finance/withdrawal-requests/" + withdrawalId,
        {
          requestType: "rejected",
          ...rejectWithdrawalForm,
        },
      );
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({
        queryKey: ["allWithdrawalRequests"],
      });
      if (withdrawalDetails) {
        withdrawalDetails.withdrawal.withdrawalStatus = "rejected";
      }
      setrejectWithdrawalForm({
        reason: "",
        message: "",
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
    <>
      {/* Main Modal */}
      <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
        <Link
          href={
            "/dashboardAdmin/finance/withdrawal-requests?withdrawalStatus=all"
          }
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
        {isSubmitting || !withdrawalDetails || isLoadingWithdrawalDetails ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className="flex mt-3">
              {/* Content */}
              <div className="p-3 flex-2 max-w-[70%] overflow-hidden">
                {/* Song Details Grid */}
                <div className="flex flex-col gap-x-12">
                  <div className="flex ">
                    {/* Song Name */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        User
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {withdrawalDetails.withdrawal.user.firstName}{" "}
                        {withdrawalDetails.withdrawal.user.lastName}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        User Email
                      </p>
                      <div>
                        <p className="text-gray-900 text-lg font-medium mb-1">
                          {withdrawalDetails.withdrawal.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex">
                    {/* Genre */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Amount Rquested
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {withdrawalDetails.withdrawal.amount}
                      </p>
                    </div>

                    {/*  Date */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Wallet Balance
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {withdrawalDetails.withdrawal.amount}
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex">
                    {/* upc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Payment Method
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        Transfer
                      </p>
                    </div>

                    {/*catalog number */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Exchange rate to ₦
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {withdrawalDetails.withdrawal.user.firstName}
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>
                  <div className="flex-1">
                    <p className="text-text-disable font-bold text-sm mb-1">
                      Payable Amount
                    </p>
                    <p className="text-gray-900 text-lg font-medium">
                      {withdrawalDetails.withdrawal.amount}
                    </p>
                  </div>
                  <div className="border border-neutral-100 mb-15"></div>
                  <div className="flex">
                    {/* upc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Bank Name
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {
                          withdrawalDetails.withdrawal.user.accountDetails
                            .bankName
                        }
                      </p>
                    </div>

                    {/*catalog number */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Account Number
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {
                          withdrawalDetails.withdrawal.user.accountDetails
                            .accountNumber
                        }
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>
                  <div className="flex">
                    {/* upc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Account Name
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {
                          withdrawalDetails.withdrawal.user.accountDetails
                            .accountHolderName
                        }
                      </p>
                    </div>

                    {/*catalog number */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Bank Country
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        Nigeria
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>
                  <div className="flex">
                    {/* upc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Request Date
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {new Date(
                          withdrawalDetails.withdrawal.createdAt
                        ).toDateString()}
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>
                </div>
              </div>
              {/* Action Buttons */}
              {withdrawalDetails.withdrawal.withdrawalStatus === "pending" && (
                <div className="bg-[#F0F0E7] border border-neutral-100 text-white flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
                  <button
                    onClick={() => setshowRejectModal(true)}
                    className="px-6 py-2 bg-error-500 border-2 border-red-500 font-semibold rounded-lg hover:bg-error-400 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setshowConfirmWithdrawalRequest(true)}
                    className="px-6 py-2 bg-primary-500  font-semibold rounded-lg hover:bg-primary-500/90 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {/* Deactivation Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
            {isSubmitting ? (
              <InlineLoadingScreen />
            ) : (
              <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
                {/* Reject Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Reject Payout Request
                  </h3>
                  <button
                    onClick={() => {
                      setshowRejectModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Reject Modal Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Please select a reason for rejecting this payout request and
                    add any additional details to help the artist make
                    corrections.
                  </p>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <div className="flex gap-1">
                        <p className="font-medium mb-2 sm:text-sm text-lg">
                          Select Deactivation Option
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
                          selected={rejectWithdrawalForm.reason}
                          setSelected={(t) =>
                            setrejectWithdrawalForm((prev) => ({
                              ...prev,
                              reason: t,
                            }))
                          }
                          placeholder="Select"
                          options={genreList}
                          name="rejectOption"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-1 sm:text-sm text-lg mt-10">
                      <p className=" capitalize font-medium">
                        Additional Notes{" "}
                      </p>{" "}
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

                    <textarea
                      value={rejectWithdrawalForm.message}
                      onChange={(e) =>
                        setrejectWithdrawalForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      className="w-full min-h-50 border-2 rounded-2xl p-4 mt-1"
                      placeholder="Add more details that will be shared in the notification email…"
                    ></textarea>
                  </div>

                  {/* Reject Modal Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setshowRejectModal(false);
                      }}
                      className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectWithdrawal}
                      disabled={
                        !rejectWithdrawalForm.message ||
                        !rejectWithdrawalForm.reason
                      }
                      className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/*info pop up */}
        <div
          className={
            showConfirmWithdrawalRequest
              ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl  "
              : " hidden"
          }
        >
          <div className="max-w-[400px] h-[400px]">
            <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex justify-center my-5">
                  <CircleCheck size={50} color="#103958" strokeWidth={1} />
                </div>
                <h3 className="text-xl font-normal leading-[30px] tracking-[-1px] text-main-heading text-center">
                  Approve Payout Request
                </h3>
                <p className="text-body-two-regular text-text-body text-center">
                  Are you sure you want to approve this payout? The requested
                  amount will be processed and sent to the user&apos;s selected
                  withdrawal method.
                </p>
              </div>
              <div className="flex gap-5 mt-5">
                <button
                  aria-label="cancel"
                  disabled={false}
                  onClick={() => {
                    setshowConfirmWithdrawalRequest(false);
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                  }
                >
                  Cancel
                </button>
                <button
                  aria-label="Approve Payout "
                  disabled={isSubmitting}
                  onClick={() => {
                    setshowConfirmWithdrawalRequest(false);
                    handleApproveWithdrawal();
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                  }
                >
                  Approve Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
