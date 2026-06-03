"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { OTP_EXPIRY_SECONDS } from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { BankObject } from "@/app/type";
import Select from "@/components/Select";
import { OTP } from "@/util/classes/OtpClass";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useAuthUser,
  useGetBankList,
  useGetUserSalesReportDashboardDetailsNames,
} from "@/util/customHooks/useQueries";
import {
  formatTime,
  numRegex,
} from "@/util/middleware/functions";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CircleDollarSign, Coins, Info, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { eligibiltyRules, rules } from "./contants";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [wantsEditAccountForm, setwantsEditAccountForm] = useState(false);
  const [isSumbittingForm, setisSumbittingForm] = useState(false);
  const [isSendingOtp, setisSendingOtp] = useState(false);
  const [timer, settimer] = useState<number | null>(null);
  const [canResend, setcanResend] = useState(false);
  const [otpText, setotpText] = useState("Send Otp");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const otpClass = new OTP(otp, setOtp, inputsRef);
  const router = useRouter();
  const api = UseAxios();
  const {
    isLoading: isLoadingSalesReport,
    data: salesReport,
    refetch: refetchBalance,
  } = useGetUserSalesReportDashboardDetailsNames();
  const [withdrawalForm, setwithdrawalForm] = useState({
    amount: "",
    bankName: "",
    bankCode: "",
    account_number: "",
    account_name: "",
    is_new_account: wantsEditAccountForm,
    is_verified: false,
  });
  const queryClient = useQueryClient();
  const [selectedBank, setSelectedBank] = useState<BankObject>();
  const [showSuccessPage, setshowSuccessPage] = useState(false);
  const [showEligibilityModal, setshowEligibilityModal] = useState(false);
  const [showRoyaltyUnavaliableModal, setshowRoyaltyUnavaliableModal] =
    useState(false);

  const {
    data: bankData,
    isLoading: bankLoading,
    error: bankError,
  } = useGetBankList({ enabled: wantsEditAccountForm });

  const {
    isLoading,
    data,
    isFetching,
    isPending,
    isRefetching,
    isError,
    refetch: refetchUser,
  } = useAuthUser();

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Advance Royalties");
  }, []);

  useEffect(() => {
    const storedExpiry = localStorage.getItem("soundmacwithdrawalotpExpiry");

    let expiryTime: number;
    if (storedExpiry) {
      expiryTime = parseInt(storedExpiry);
      setotpText("Resend Otp");
    }
    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.floor((expiryTime - Date.now()) / 1000),
      );
      settimer(secondsLeft);
      if (secondsLeft === 0) {
        setotpText("Resend Otp");
        setcanResend(true);
        clearInterval(interval);
      } else {
        console.log(secondsLeft);
        setcanResend(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canResend, timer]);

  const handleSubmit = async () => {
    try {
      setisSumbittingForm(true);
      console.log(withdrawalForm);
      if (withdrawalForm.is_new_account) {
        if (!selectedBank) {
          return toast.warn("Please slect a bank.");
        }
        withdrawalForm.bankName = selectedBank.name;
        withdrawalForm.bankCode = "001";
      }
      const finalOtp = otp.join("");
      if (
        !withdrawalForm.amount ||
        !numRegex.test(withdrawalForm.amount) ||
        parseInt(withdrawalForm.amount, 10) < 1000
      ) {
        return toast.warn("Please enter an amount equal or above 1000");
      } else if (otp.some((digit) => digit === "" || finalOtp.length < 6)) {
        toast.warn("Please enter the complete 6-digit OTP.");
        return;
      }
      const res = await api.post(
        "users/withdrawal",
        { ...withdrawalForm, otp: finalOtp },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      localStorage.setItem(
        "soundmacwithdrawalotpExpiry",
        (Date.now() - OTP_EXPIRY_SECONDS * 1000).toString(),
      );
      await refetchUser();
      await refetchBalance();
      setOtp(["", "", "", "", "", ""]);
      setwantsEditAccountForm(false);
      setshowSuccessPage(true);
      setwithdrawalForm({
        amount: "",
        bankName: "",
        bankCode: "",
        account_number: "",
        account_name: "",
        is_new_account: false,
        is_verified: false,
      });
      toast.success(res?.data?.msg);
      queryClient.invalidateQueries({
        queryKey: ["withdrawals"],
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setisSumbittingForm(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setisSendingOtp(true);
      const res = await api.get("users/withdrawal");
      toast.success(res?.data?.msg);
      localStorage.setItem(
        "soundmacwithdrawalotpExpiry",
        (Date.now() + OTP_EXPIRY_SECONDS * 1000).toString(),
      );
      settimer((Date.now() + OTP_EXPIRY_SECONDS * 1000 - Date.now()) / 1000);
      setotpText("Resend Otp");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setisSendingOtp(false);
    }
  };

  const handleVerifyAccountNumber = async () => {
    try {
      if (!selectedBank) {
        return toast.warn("Please slect a bank.");
      }
      withdrawalForm.bankName = selectedBank.name;
      withdrawalForm.bankCode = selectedBank.code;
      if (!withdrawalForm.account_number) {
        return toast.warn("Please enter an account number equal or above 1000");
      }
      setisSumbittingForm(true);
      const res = await api.post("users/user", {
        bankName: selectedBank.name,
        bankCode: selectedBank.code,
        country: data?.country,
        account_number: withdrawalForm.account_number,
      });
      toast.success(res?.data?.msg);
      setwithdrawalForm({
        amount: "",
        bankName: "",
        bankCode: "",
        account_number: res.data.accountDetails.accountNumber,
        account_name: res.data.accountDetails.accountHolderName,
        is_new_account: wantsEditAccountForm,
        is_verified: true,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setisSumbittingForm(false);
    }
  };

  //   const handleResend = async () => {
  //     try {
  //       setLoading(true);
  //       if (!email) {
  //         toast.error("No email found to resend OTP.");
  //         return;
  //       }
  //       const body = { email };
  //       const res = await api.patch("auth/otp", body);
  //       if (res.statusText === "OK") {
  //         toast.success(res.data.msg);
  //         const newExpiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;
  //         localStorage.setItem("soundmacotpExpiry", newExpiry.toString());
  //         setcanResend(false);
  //         settimer(OTP_EXPIRY_SECONDS);
  //       }
  //     } catch (error) {
  //       if (error instanceof AxiosError) {
  //         console.log(error);
  //         return;
  //       }
  //       toast.error(error as string);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;

    setwithdrawalForm((prev) => ({ ...prev, [name]: value }));
  };
  if (bankError) {
    toast.warn("Unable to get back names please try again later");
    router.push("/dashboard/finance/salesReport");
    return;
  }
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
      <div className="md:max-w-[50%] my-5">
        <p className="text-text-body font-light ">
          Get early access to a portion of your future earnings. If eligible,
          you can request an advance and repay it automatically from upcoming
          royalty payouts.
        </p>
      </div>
      {isLoading ||
      !data ||
      isSumbittingForm ||
      bankLoading ||
      isLoadingSalesReport ||
      !salesReport ? (
        <InlineLoadingScreen />
      ) : !showSuccessPage ? (
        <div className="mt-5 flex flex-col gap-5 mb-10">
          <div className="flex max-lg:flex-col gap-5">
            <div className=" w-full flex-1">
              <div className="bg-warning-50 flex flex-col w-full gap-3 p-5 rounded-2xl flex-1 h-fit">
                <h1 className="font-semibold text-[16px] flex gap-1 leading-[20px] tracking-tighter text-primary-500">
                  <Coins color="#103958" /> Eligible Amount
                </h1>
                <p className="font-bold leading-[60px] -tracking-widest text-4xl text-primary-500">
                  $ *********
                </p>
                <button
                  onClick={() => setshowEligibilityModal(true)}
                  type="button"
                  className={
                    "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
                  }
                >
                  Check Eligibility
                </button>
              </div>
            </div>
            <div className="flex-1">
              {!wantsEditAccountForm && (
                <div className="border-1 border-neutral-100 bg-neutral-50 flex flex-col gap-3 rounded-lg p-5">
                  <h2 className="text-text-disable font-semibold text-md">
                    Payment Method
                  </h2>
                  <div className="flex gap-3 flex-wrap text-text-body text-xl font-normal">
                    <div className="flex items-center">
                      <input
                        id="link-checkbox"
                        type="checkbox"
                        checked={data.accountDetails.verified}
                        disabled
                        className="w-4 h-4 rounded-lg bg-primary-500 focus:ring-2 focus:ring-brand-soft accent-primary-500"
                      />
                      <label
                        htmlFor="link-checkbox"
                        className="select-none ms-2 text-sm font-medium text-heading"
                      ></label>
                    </div>
                    <p className="line-clamp-1">
                      | {data.accountDetails.accountHolderName} |
                    </p>
                    <p className="line-clamp-1">
                      | {data.accountDetails.bankName} |
                    </p>
                    <p className="line-clamp-1">
                      | {data.accountDetails.accountNumber} |
                    </p>
                  </div>
                  <button
                    onClick={() => setwantsEditAccountForm(true)}
                    className={
                      " text-center font-bold py-2 items-center rounded-lg gap-2 px-5 h-fit max-w-fit hover:bg-primary/90 border-2 text-white border-primary flex bg-primary-500 text-xs max-sm:w-fit"
                    }
                  >
                    Use different payment method
                  </button>
                </div>
              )}
            </div>
          </div>
          {wantsEditAccountForm && (
            <div className="w-full flex flex-wrap justify-between gap-y-10 mt-5 ">
              {/* <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={withdrawalForm.amount}
                  title={"Amount"}
                  type={"text"}
                  name={"title"}
                  placeholder={"Enter Song Title"}
                  updateValue={handleChange}
                  required={true}
                />
              </div> */}
              <div className="flex flex-col w-[40%] max-sm:w-full mb-5">
                <p className="font-medium mb-2 sm:text-sm text-lg flex gap-1">
                  Bank Name
                  <Image
                    priority={false}
                    loading="lazy"
                    src="/required.svg"
                    alt="a star marking this field as required"
                    width={0}
                    height={0}
                    className="w-2 -mt-3 "
                  />
                </p>
                <div className="w-full">
                  <Select
                    selected={selectedBank?.name || ""}
                    setSelected={(t) =>
                      setSelectedBank(
                        bankData!.data?.find((bank, index) => bank.name === t),
                      )
                    }
                    placeholder="Select bank..."
                    options={bankData?.data?.map((bank) => bank.name) ?? []}
                    name="bankName"
                    //   isDisabled={!wantsToEdit}
                  />
                </div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={withdrawalForm.account_number}
                  title={"account number"}
                  type={"text"}
                  name={"account_number"}
                  placeholder={"Enter Amount number"}
                  updateValue={handleChange}
                  required={true}
                />
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full justify-end">
                <p className="bg-neutral-100 p-5 rounded-lg text-primary-500 font-semibold text-md leading-5 tracking-tighter">
                  {withdrawalForm.is_verified
                    ? withdrawalForm.account_name
                    : "Account not found"}
                </p>
              </div>
              <div className="flex gap-3 w-[40%] mt-auto">
                <button
                  type="button"
                  onClick={handleVerifyAccountNumber}
                  disabled={withdrawalForm.is_verified}
                  className={
                    "px-10 p-3 font-bold rounded-xl text-center max-w-fit h-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white"
                  }
                >
                  Verify
                </button>
                <button
                  type="button"
                  disabled={withdrawalForm.is_verified}
                  onClick={() => setwantsEditAccountForm(false)}
                  className={
                    "px-10 py-3 font-bold rounded-xl text-center max-w-fit h-fit hover:cursor-pointer text-sm bg-transparent border-2 border-text-disable text-text-disable"
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* border line */}
          <div className="border border-neutral-100"></div>

          {/* amount */}
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <Input
              value={withdrawalForm.amount}
              title={"Amount"}
              type={"text"}
              name={"amount"}
              placeholder={"Enter Amount"}
              updateValue={handleChange}
              required={true}
              disabled={true}
            />
          </div>

          {/* border line */}
          <div className="border border-neutral-100"></div>

          {/* otp */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  disabled={true}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => otpClass.handleChange(e.target.value, index)}
                  onKeyDown={(e) => otpClass.handleKeyDown(e, index)}
                  className="bg-transparent w-10 h-10 text-center text-xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-primary"
                />
              ))}
            </div>
            <div className="flex gap-6 items-center">
              <button
                disabled={true}
                onClick={handleSendOtp}
                className={
                  "text-sm w-fit px-2 font-semibold py-1 rounded-lg transition hover:cursor-pointer border-1 border-primary-500" +
                  (isSendingOtp || (timer != 0 && otpText === "Resend Otp")
                    ? " bg-disable"
                    : " bg-transparent hover:bg-primary/80 hover:text-white text-primary-500")
                }
              >
                {otpText}
              </button>
              <p className="text-primary-500 text-center text-sm font-bold">
                {formatTime(timer || 0)}
              </p>
            </div>
          </div>

          {/* <button
            disabled={true}
            onClick={() => handleSubmit()}
            className={
              "text-md w-fit px-4 font-semibold py-2 rounded-lg transition hover:cursor-pointer border-1 border-primary-500 text-white " +
              (false ? " bg-disable" : " bg-primary-500 hover:bg-primary/80 ")
            }
          >
            Submit
          </button> */}
          <div className="bg-warning-50 sm:max-w-[60%] rounded-2xl p-3 mt-10">
            <div className="flex gap-2">
              <span>
                <Info color="#C58629" />
              </span>
              <p className="text-text-disable">Rules of Payment</p>
            </div>
            <ul className="list-disc mt-4 ml-5 text-caption-one flex flex-col gap-1">
              {rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-full w-full h-full mt-[15%]">
          <div className="xs:w-[70%] flex flex-col justify-center items-center min-h-full gap-0">
            <Image
              alt="check mark"
              width={100}
              height={100}
              src={"/tick-circle2.svg"}
            />
            <h1 className="font-semibold text-2xl text-primary-500">
              Withdrawal Request Sent
            </h1>
            <p className="text-main-heading font-normal text-sm leading-5 tracking-[0.5px] text-center">
              Your request has been received and is now being processed.
              You&apos;ll get an update once the transfer is complete.
            </p>
            <div className="flex gap-3 mt-10">
              <Link
                href={"/dashboard/finance/salesReport"}
                type="button"
                className={
                  "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
                }
              >
                Go to Sales Report
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* eligibiltity Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-30">
          {isSumbittingForm ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl lg:w-[700px] w-[500px] m-5 shadow-2xl h-fit">
              {/* Reject Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="lg:text-xl text-lg font-semibold text-gray-900">
                  Eligibilty for Advanced Royalties
                </h3>
                <button
                  onClick={() => {
                    setshowEligibilityModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <ul className="list-disc my-4 ml-5 text-caption-one flex flex-col gap-1 px-2">
                {eligibiltyRules.map((rule, index) => (
                  <li key={index} className="text-text-body lg:text-lg text-sm">
                    <span className="font-extrabold ">{rule.title}: </span>
                    <span className="font-light">{rule.body}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-[#F0F0E7] rounded-b-2xl border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 w-full">
                <button
                  onClick={() => {
                    setshowRoyaltyUnavaliableModal(true)
                  }}
                  className={
                    "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
                  }
                >
                  Apply Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        {/*info pop up */}
        <div
          className={
            showRoyaltyUnavaliableModal
              ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl  "
              : " hidden"
          }
        >
          <div className="max-w-[400px] h-[400px]">
            <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex justify-center my-5">
                  <CircleDollarSign size={50} color="#103958" strokeWidth={1} />
                </div>
                <h3 className="lg:text-xl text-lg font-normal leading-[30px] tracking-[-1px] text-main-heading text-center">
                  Advance Royalties Unavailable
                </h3>
                <p className="text-body-two-regular text-text-body text-center">
                 Your account is not currently eligible for an advance royalty request at this time.
                </p>
              </div>
              <div className="flex gap-5 mt-5">

                <button
                  aria-label="Approve Payout "
                  onClick={() => {
                    setshowRoyaltyUnavaliableModal(false);
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 bg-primary-500 flex text-white outline-2 outline-primary-500 "
                  }
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Page;
