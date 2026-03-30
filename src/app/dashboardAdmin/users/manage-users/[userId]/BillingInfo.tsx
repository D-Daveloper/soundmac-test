"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import WithdrawalLine from "@/app/dashboard/finance/salesReport/history/withdrawalLine";
import { BankObject } from "@/app/type";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useAuthUser,
  useGetAdminUserDetails,
  useGetBankList,
  useGetUserWithdrawals,
  useWithdrawals,
} from "@/util/customHooks/useQueries";
import { isPaymentformValid } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { ExternalLink, PencilLine } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const formData = [
  {
    title: "Account Holder Name",
    placeholder: "Enter your account name",
    alt: "a user icon for first name",
    image: "/user.svg",
    required: true,
    name: "account_name",
  },
  {
    title: "account number",
    placeholder: "Enter your account number",
    alt: "a user icon for bank name",
    image: "/user.svg",
    required: true,
    name: "account_number",
  },
];
type PaymentForm = {
  account_name: string;
  bankName: string;
  bankCode: string;
  country: string;
  account_number: string;
};

const BillingInfo = ({ userId }: { userId: string }) => {
  if (!userId) {
    return <InlineLoadingScreen />;
  }
  const {
    isLoading: isLoadinguserDetails,
    data: userDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetAdminUserDetails({ userId });
  const api = UseAxios();
  const [wantsToEdit, setWantsToEdit] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    account_name: "",
    bankCode: "",
    bankName: "",
    country: "",
    account_number: "",
  });

  const {
    data: withdrawals,
    isFetching: isFetchingWithdrawals,
    isFetchingNextPage,
    // isRefetching:isRefecthingWithdrawals,
    isError: isWithdrawalError,
    hasNextPage,
    status,
    fetchNextPage,
  } = useGetUserWithdrawals({
    userId,
  });

  return (
    <div className=" w-full flex flex-col">
      {isLoadinguserDetails || !userDetails ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="flex gap-8 py-5 pb-20">
            <div className="flex-3 overflow-auto flex flex-col gap-10 px-1 min-h-[64dvh]">
              <div className="">
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Subscription Billing
                </h1>
                <div className="bg-white border border-neutral-100 p-10 mt-5 max-w-[800px] rounded-lg  ">
                  <h2 className="text-md font-semibold leading-[20px] tracking-[-0.5px] text-main-heading capitalize">
                    Card Details -{" "}
                    {userDetails.data.subscriptionDetails?.cardType || ""} ending in{" "}
                    {userDetails.data.subscriptionDetails?.lastFourDigits || ""}
                  </h2>
                </div>
              </div>
              {/* payment info */}
              <div className="bg-[#FFFFFF] rounded-lg max-w-[800px]">
                <h2 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Payout Account
                </h2>
                <div className="px-5">
                  <div className="flex justify-between items-baseline max-[420px]:flex-col gap-y-5">
                    <h2 className="text-xl mt-10 font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Account Details
                    </h2>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mt-5"></div>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-5 ">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={
                          userDetails.data.accountDetails.accountHolderName ||
                          ""
                        }
                        title={"Account Holder Name"}
                        name={"account_holder_name"}
                        placeholder={"Account holder"}
                        updateValue={(e) => {}}
                        required={false}
                        disabled={true}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={
                          userDetails.data.accountDetails.accountNumber || ""
                        }
                        title={"Account number"}
                        name={"account_number"}
                        placeholder={"Account number"}
                        updateValue={(e) => {}}
                        required={false}
                        disabled={true}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Country
                      </p>
                      <div className="w-full">
                        <Select
                          selected={userDetails.data.country || ""}
                          setSelected={(t) =>
                            setPaymentForm((prev) => ({ ...prev, country: t }))
                          }
                          placeholder="Select Country..."
                          options={country_list}
                          name="country"
                          isDisabled={true}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Bank Name
                      </p>
                      <div className="w-full">
                        <Select
                          selected={
                            userDetails.data.accountDetails.bankName || ""
                          }
                          setSelected={(t) => {}}
                          placeholder="Select bank..."
                          options={[]}
                          name="bankName"
                          isDisabled={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* history */}
              {isFetchingWithdrawals ? (
                <InlineLoadingScreen />
              ) : withdrawals && withdrawals?.pages[0].data.length < 1 ? (
                <div className="flex flex-col justify-center items-center  gap-15 ">
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
                    No withdrawal History
                  </p>
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-5 mb-10 h-[300px] overflow-y-auto">
                  <div className="flex flex-col gap-3 w-full">
                    {withdrawals?.pages.map((items, index) =>
                      items.data.map((item, idx) => (
                        <WithdrawalLine
                          key={idx}
                          status={item.withdrawalStatus}
                          account_number={item.accountNumber}
                          amount={item.amount}
                          date={new Date(item.createdAt)?.toDateString()}
                        />
                      )),
                    )}
                    <div className="flex justify-center">
                      <button
                        className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 flex text-white! bg-primary-500 disabled:bg-gray-300"
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingInfo;
