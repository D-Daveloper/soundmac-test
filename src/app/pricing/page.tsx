"use client";
import { FaRegCheckCircle } from "react-icons/fa";
import { pricing } from "./constants";
import classes from "./page.module.css";
import { PricingObjects } from "./types";
import { Fragment, useEffect, useState } from "react";
import { X } from "lucide-react";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BeatLoader } from "react-spinners";
import { useAuthUser } from "@/util/customHooks/useQueries";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function Pricing() {
  const api = UseAxios();
  const router = useRouter();
  const { data: authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isPlanChange = searchParams.get("mode") === "change";

  const [wantsToSubscribe, setWantsToSubscribe] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, SetSelectedPlan] = useState<null | PricingObjects>(null);
  const [email, setEmail] = useState("");

  // Load Paystack Inline script once, on mount
  useEffect(() => {
    if (document.getElementById("paystack-inline-js")) return;
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const verifyPayment = async (reference: string) => {
    try {
      const res = await api.put("/payments", JSON.stringify({ reference }));
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      router.push("/dashboard/subscription");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.msg ||
            "Could not verify payment. Contact support if you were charged.",
        );
      } else {
        console.error("verify error", error);
        toast.error("Something went wrong verifying your payment.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const subscribe = async (plan: string, email: string) => {
    if (!authUser?.email) {
      return toast.warn(
        "Could not determine your account email. Please try logging in again.",
      );
    } else if (!plan) {
      return toast.warn("Please select a plan.");
    }

    try {
      setIsSubscribing(true);
      // console.log(plan);

      const res = isPlanChange
        ? await api.patch(
            "/payments",
            JSON.stringify({ email: authUser.email, plan }),
          )
        : await api.post(
            "/payments",
            JSON.stringify({ email: authUser.email, plan }),
          );
      // = await api.post(
      //   "/payments",
      //   JSON.stringify({ email: email, plan }),
      // );
      const { accessCode, reference } = res.data;

      if (!window.PaystackPop) {
        toast.error("Payment popup failed to load. Please try again.");
        setIsSubscribing(false);
        return;
      }

      const popup = new window.PaystackPop();
      popup.resumeTransaction(accessCode, {
        onSuccess: () => verifyPayment(reference),
        onCancel: () => {
          toast.info("Payment cancelled.");
          setIsSubscribing(false);
          setWantsToSubscribe(false);
        },
        onError: (err: any) => {
          console.error("paystack error", err);
          toast.error("Payment failed. Please try again.");
          setIsSubscribing(false);
        },
      });
    } catch (error) {
      if (isAxiosError(error)) {
        setIsSubscribing(false);
        return;
      } else {
        console.error("payment error", error);
        toast.error("Something went wrong.");
        setIsSubscribing(false);
      }
    }
  };
  return (
    <section className={classes.container}>
      <h3 className={classes.h3}>
        Flexible Plans for Every Business/individual Size
      </h3>
      <p className={classes.subTitle}>
        Choose the perfect plan that fits your needs, From individual creators
        to the biggest enterprises, we have a plan for you.
      </p>

      <div className={classes.groupedPricingCards}>
        {pricing.map((item, index) => (
          <PricingCard
            key={index}
            props={item}
            setPlan={(plan: PricingObjects) => {
              SetSelectedPlan(plan);
              setWantsToSubscribe(true);
            }}
          />
        ))}
      </div>

      <div
        className={
          wantsToSubscribe && selectedPlan
            ? " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
            : " hidden"
        }
      >
        <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
          <button
            disabled={isSubscribing}
            onClick={() => setWantsToSubscribe(false)}
            className="ml-auto bg-error-500 p-1 rounded-sm text-white flex justify-center items-center mb-5"
          >
            <X width={20} height={20} />
          </button>
          <div className="flex flex-col gap-2 mb-2">
            <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
              {isPlanChange ? "Change to" : "Subscribe to"}{" "}
              {selectedPlan?.title}
            </h3>
            <p className="text-text-body text-sm">
              {authUser?.email
                ? `Subscribing as ${authUser.email}`
                : "Loading your account details..."}
            </p>
          </div>

          {/* <div className="flex flex-col gap-2 mb-2">
            <h3 className="text-xl font-semibold  tracking-[-0.5px] text-main-heading">
              Subscribe to {selectedPlan?.title}
            </h3>
            <p className="">Please Enter your Registered email.</p>
            <input
              type="email"
              required={true}
              value={email}
              className="border-2 border-primary rounded-lg outline-none px-2"
              onChange={(e) => {
                setEmail(e.target.value);
                console.log(e.target.value);
              }}
            />
          </div> */}
          <div>
            <button
              aria-label="confirm subscription"
              disabled={isSubscribing}
              onClick={() => {
                if (selectedPlan) subscribe(selectedPlan.plan, email);
              }}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 flex text-white " +
                (isSubscribing ? " bg-disable" : " bg-primary-500")
              }
            >
              {isSubscribing ? (
                <BeatLoader size={12} color="#fff" />
              ) : (
                <p>Proceed to Payment</p>
              )}
              {/* Proceed to Payment */}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  props,
  setPlan,
}: {
  props: PricingObjects;
  setPlan: (plan: PricingObjects) => void;
}) {
  return (
    <div className={classes.cardContainer}>
      {props.popular && <p className={classes.popularCap}>Popular</p>}
      <div
        className={`${classes.smallCard} ${props.bigBox ? classes.bigCard : ""} ${props.popular ? classes.popularCard : ""}`}
      >
        <h4
          style={props.popular ? { color: "#fff" } : {}}
          className={classes.h4}
        >
          {props.title}
        </h4>
        <p
          style={props.popular ? { color: "#f5f5f5" } : {}}
          className={classes.pricingCardSubtitle}
        >
          {props.subTitle}
        </p>
        <h1
          style={props.popular ? { color: "#fff" } : {}}
          className={classes.cardPrice}
        >
          {props.price} <span className={classes.cardDuration}>/ yr</span>
        </h1>
        <button
          onClick={() => {
            if (props.prompt === "Contact Us") {
              return;
            } else {
              setPlan(props);
            }
          }}
          className={`${classes.cardPromptBtn}  ${props.popular ? classes.popularPromptBtn : ""} ${props.prompt === "Contact Us" ? classes.contactUsPromptBtn : ""}`}
        >
          {props.prompt}
        </button>
      </div>
      <div
        className={`${classes.smallLongCard} ${props.bigBox ? classes.bigLongCard : ""}`}
      >
        {props.features.map((feature, idx) => (
          <Fragment key={idx}>
            <div className={classes.checkAndFeatureGroup}>
              <div>
                <FaRegCheckCircle className={classes.cardCheck} />
              </div>

              <p>{feature}</p>
            </div>
            {idx !== props.features.length - 1 && (
              <div className={classes.horizontalLine} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
