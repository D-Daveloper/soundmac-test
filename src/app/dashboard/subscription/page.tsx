"use client";
import { NormalLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import UseAxios from "@/util/customHooks/UseAxios";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
const profileInfoButtons = [
  {
    title: "My Subscritpion",
    query: "profile-info",
  },
];
const page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { data, isLoading,refetch } = useAuthUser();
  const info = profileInfoButtons[0].query;
  const router = useRouter();
  const [details, setDetails] = useState({
    description_text: "",
    amount: 0,
  });
  const api = UseAxios();
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Subscription");
  }, []);

  if (!data || isLoading) {
    return <NormalLoadingScreen />;
  }

  let description_text = "";
  let amount = 0;

  useEffect(() => {
    switch (data.type) {
      case "EMERGING_ARTIST":
        setDetails({
          description_text: "Perfect for starters with occasional release.",
          amount: 9.99,
        });
        break;
      case "INDEPENDENT_ARTIST":
        setDetails({
          description_text: "Ideal for active artists without a record label.",
          amount: 17.99,
        });
        break;
      case "INDIE_LABEL":
        setDetails({
          description_text: "Register for up to 10 multiple artist accounts",
          amount: 69.99,
        });
        break;
      case "MAJOR_LABEL":
        setDetails({
          description_text: "Register for up to 100 multiple artist accounts",
          amount: 99.99,
        });
        break;

      default:
        setDetails({
          description_text: "Free User",
          amount: 0,
        });

        break;
    }
    console.log(data.type);
  }, [data]);
  console.log(amount, description_text);

  async function handleCancelSubscription() {
    try {
      const res = await api.put("payments/subscriptions",JSON.stringify({type:"disable"}));
      await refetch();
      toast.error(res.data.msg);
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      } else {
        console.log(error);

        toast.error("Something went wrong.");
      }
    }
  }
  return (
    <div className="bg-main-white h-screen w-full flex flex-col lg:pl-[260px] px-5">
      <div className="flex gap-3 mt-5 flex-wrap mb-10">
        {profileInfoButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            // onClick={() => setParam("info", button.query)}
            className={
              "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
              (info === button.query
                ? " bg-primary hover:bg-primary/90 text-white"
                : " bg-transparent border-2 border-text-disable text-text-disable")
            }
          >
            {button.title}
          </button>
        ))}
      </div>
      {!data.premium ? (
        <div className="flex flex-col justify-center items-center h-full gap-5 min-h-[90dvh]">
          <div>
            <Image
              priority={true}
              src={"/no_sub_image.png"}
              alt="an image depicting no subscription on the account"
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-text-body font-semibold leading-[24px] tracking-[-0.5px] text-[20px] sm:max-w-[40%] text-center">
            No Active Subscription
          </h1>
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
            You havent released any singles. Upload your first track to get
            started.
          </p>
          <button
            onClick={() => {
              router.push("/pricing");
            }}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
            }
          >
            View Plans
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex gap-5 max-lg:flex-col">
          <div className="border-2 border-neutral-100 w-120 max-lg:w-full max-h-55 p-3 rounded-lg flex-1">
            <div className="bg-secondary-50 h-full w-full border border-neutral-50 rounded-lg flex items-center justify-center gap-3 flex-col">
              <h2 className="font-semibold text-2xl tracking-[-1px] leading-8 capitalize ml-5 h-8">
                {data.type}
              </h2>
              <p className="text-text-body font-light leading-[20px] tracking-tighter text-sm">
                {details.description_text}
              </p>
              <p className="text-main-icon-color font-semibold leading-[18px] -tracking-tight text-3xl ">
                ${details.amount}
                <span className="text-text-disable text-sm ">/yr</span>
              </p>
              <Link href={"/pricing"} className="text-primary-500! font-bold leading-[20px] tracking-tighter text-sm">
                Learn more about your plan
              </Link> 
            </div>
          </div>
          <div className="border-2 border-neutral-100 w-120 max-lg:w-full max-h-55 p-3 rounded-lg bg-neutral-50 flex items-center justify-center gap-8 flex-col flex-2">
            <h2 className="text-text-disable font-semibold text-xl tracking-[-0.5px] leading-8 capitalize ml-5">
              Your next bill is for ${details.amount} on{" "}
              {data.premiumExpiration &&
                new Date(data.premiumExpiration).toDateString()}
            </h2>
            <p className="text-main-icon-color font-semibold leading-[18px] -tracking-tight text-xl uppercase">
              {data.subscriptionDetails?.cardType} -{" "}
              {data.subscriptionDetails?.lastFourDigits}
            </p>
            <button
              aria-label="cancel subscription"
              disabled={data.subscriptionDetails?.subscriptionStatus != "active"}
              onClick={handleCancelSubscription}
              className={
                "font-bold text-sm rounded-lg px-4 py-2.5 flex text-white  " + (data.subscriptionDetails?.subscriptionStatus != "active" ? "bg-error-500/70" : " bg-error-500 hover:bg-error-500/80")
              }
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}
      {/* {!info || (info === "profile-info" && <AccountInfo />)}
      {(info === "payments" && <PaymentForm />)}
      {(info === "payments" && <PaymentForm />)} */}
    </div>
  );
};

export default page;
