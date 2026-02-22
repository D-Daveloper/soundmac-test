"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useAuthUser } from "@/util/customHooks/useQueries";
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
    title: "bank name",
    placeholder: "Enter your Bank name",
    alt: "a user icon for bank name",
    image: "/user.svg",
    required: true,
    name: "bank_name",
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
  country: string;
  account_number: string;
};

const PaymentForm = () => {
  const { data, isLoading } = useAuthUser();
  const api = UseAxios();
  const [wantsToEdit, setWantsToEdit] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    account_name: "",
    bankName: "",
    country: "",
    account_number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      console.log(paymentForm);
      const formData = new FormData();
      Object.entries(paymentForm).forEach(([key, value]) => {
        if (value != null) {
          formData.append(key, value);
        }
      });
      console.log(...formData);
      let res;
      return;
      res = await api.post("album", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.msg);
      setPaymentForm({
        account_name: "",
        bankName: "",
        country: "",
        account_number: "",
      });
      setWantsToEdit(false);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGenerateEditCardLink = async () => {
    try {
      setIsSubmittingForm(true);
      let res;
      res = await api.get("payments/subscriptions");
      toast.info("You will be redirected now.");
      window.open(res.data.url, "_blank");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  useEffect(() => {
    if (data) {
      setPaymentForm({
        account_name: data.firstName,
        account_number: data.lastName,
        country: data.country,
        bankName: data.email,
      });
    }
  }, [data]);

  return (
    <div className=" w-full max-w-[800px] flex flex-col">
      {isLoading || !data || isSubmittingForm ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="flex gap-8 py-5 pb-20">
            <div className="flex-3 overflow-auto flex flex-col gap-10 px-1 min-h-[64dvh]">
              <div>
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Subscription Billing
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 ">
                  Manage how you pay for your Soundmac subscription.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateEditCardLink}
                  className={
                    "px-2 py-1 mt-5 font-bold rounded-lg text-center max-w-fit flex items-center h-8 hover:cursor-pointer text-sm bg-transparent border-2 border-primary-500 text-primary-500"
                  }
                >
                  <ExternalLink color="#11456B " /> Generate Link
                </button>
              </div>
              {/* payment info */}
              <div className="bg-[#FFFFFF] rounded-lg max-w-[800px]">
                <h2 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Payout Account
                </h2>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3">
                  Add or update the bank account where you&apos;ll receive
                  royalties, sales, and earnings.
                </p>
                <div className="px-5">
                  <div className="flex justify-between items-baseline max-[420px]:flex-col gap-y-5">
                    <h2 className="text-xl mt-10 font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Account Details
                    </h2>
                    <button
                      type="button"
                      // onClick={() => setParam("type", "album")}
                      className={
                        "px-2 py-1 font-bold rounded-lg text-center max-w-fit flex items-center h-8 hover:cursor-pointer text-sm bg-transparent border-2 border-primary-500 text-primary-500"
                      } 
                    >
                      <PencilLine color="#11456B " /> Edit Account Info
                    </button>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mt-5"></div>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-5 ">
                    {formData.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col w-[40%] max-sm:w-full"
                      >
                        <Input
                          value={
                            (paymentForm[
                              data.name as keyof typeof paymentForm
                            ] as string) ?? ""
                          }
                          title={data.title}
                          name={data.name}
                          placeholder={data.placeholder}
                          updateValue={handleChange}
                          required={false}
                          disabled={!wantsToEdit}
                        />
                      </div>
                    ))}
                    <div className="flex flex-col w-[40%] max-sm:w-full mb-5">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Country
                      </p>
                      <div className="w-full">
                        <Select
                          selected={paymentForm.country}
                          setSelected={(t) =>
                            setPaymentForm((prev) => ({ ...prev, country: t }))
                          }
                          placeholder="Select Country..."
                          options={country_list}
                          name="country"
                          isDisabled={!wantsToEdit}
                        />
                      </div>
                    </div>
                  </div>
                  <p
                    className={
                      "font-bold leading-[18px] tracking-tighter text-xs capitalize mt-4 w-fit px-4 py-1 rounded-full  text-error-500 bg-error-100"
                    }
                  >
                    Not Verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentForm;
