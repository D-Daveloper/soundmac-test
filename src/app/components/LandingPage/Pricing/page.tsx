"use client";
import { FaRegCheckCircle } from "react-icons/fa";
import { pricing } from "./constants";
import classes from "./page.module.css";
import { PricingObjects } from "./types";
import { Fragment, useState } from "react";
import { X } from "lucide-react";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { IoMdInformationCircle } from "react-icons/io";


export default function Pricing() {
  const api = UseAxios();
  const [wantsToSubscribe, setWantsToSubscribe] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<null | PricingObjects>(null);
  const [viewingFeatures, setViewingFeatures] = useState<null | PricingObjects>(
    null,
  );
  const [email, setEmail] = useState("");

  const subscribe = async (plan: string, email: string) => {
    try {
      setIsSubscribing(true);
      if (!email) return toast.warn("Please provide a valid email.");
      if (!plan) return toast.warn("Please select a plan.");
      const res = await api.post("/payments", JSON.stringify({ email, plan }));
      toast.info("You will be redirected now.");
      window.location.href = res.data.url;
    } catch (error) {
      if (isAxiosError(error)) return;
      console.error("payment error", error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section className={`classes.container md:mt-20 mt-10 lg:mx-10`}>
      <h2 className="text-center text-[#103958] text-2xl lg:text-4xl capitalize font-semibold">
        Everything you need, one plan away
      </h2>

      <div className={classes.groupedPricingCards}>
        {pricing.map((item, index) => (
          <PricingCard
            key={index}
            index={index}
            props={item}
            setPlan={(plan: PricingObjects) => {
              setSelectedPlan(plan);
              setWantsToSubscribe(true);
            }}
            onLearnMore={(plan: PricingObjects) => setViewingFeatures(plan)}
          />
        ))}
      </div>

      {/* ── Subscribe modal ── */}
      {wantsToSubscribe && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col w-[90vw] max-w-sm py-5 px-6 sm:px-10 justify-center items-center bg-neutral-100 rounded-lg shadow-2xl">
            <button
              disabled={isSubscribing}
              onClick={() => setWantsToSubscribe(false)}
              className="ml-auto bg-red-500 p-1 rounded-sm text-white flex justify-center items-center mb-5"
            >
              <X width={20} height={20} />
            </button>
            <div className="flex flex-col gap-2 mb-4 w-full">
              <h3 className="text-xl font-semibold tracking-[-0.5px] text-[#103958]">
                Subscribe to {selectedPlan.title}
              </h3>
              <p className="text-sm text-gray-500">
                Please enter your registered email.
              </p>
              <input
                type="email"
                required
                value={email}
                placeholder="you@example.com"
                className="border-2 border-[#11456B] rounded-lg outline-none px-3 py-2 text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              aria-label="confirm subscription"
              disabled={isSubscribing}
              onClick={() => {
                if (selectedPlan) subscribe(selectedPlan.plan, email);
              }}
              className={
                "font-bold text-sm rounded-lg px-4 py-2.5 text-white w-full " +
                (isSubscribing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#11456B] hover:opacity-80 transition-opacity")
              }
            >
              {isSubscribing ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      )}

      {/* ── Features modal ── */}
      {viewingFeatures && (
        <div
          className="fixed inset-0 z-50 top-10 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setViewingFeatures(null)}
        >
          <div
            className="relative flex flex-col w-fit max-w-md max-h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-[#103958]">
                  {viewingFeatures.title}
                </h3>
                <p className="text-[12px] text-gray-400">
                  {viewingFeatures.subTitle}
                </p>
              </div>
              <button
                onClick={() => setViewingFeatures(null)}
                className="p-1 rounded-sm text-white bg-[#11456b] flex items-center justify-center flex-shrink-0 ml-4"
              >
                <X width={18} height={18} />
              </button>
            </div>

            {/* Scrollable features list */}
            <div className="overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {viewingFeatures.features.map((feature, idx) => (
                <Fragment key={idx}>
                  <div className="flex items-center gap-3">
                    <FaRegCheckCircle
                      className="text-[#11456B] flex-shrink-0"
                      size={14}
                    />
                    <p className="text-[12px] text-[#5E5E5E]">{feature}</p>
                  </div>
                  {idx !== viewingFeatures.features.length - 1 && (
                    <div className="w-full h-px bg-gray-200" />
                  )}
                  <div className="border w-[100%] "></div>
                </Fragment>
              ))}
            </div>

            {/* Footer CTA */}
            {viewingFeatures.prompt !== "Contact Us" && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setViewingFeatures(null);
                    setSelectedPlan(viewingFeatures);
                    setWantsToSubscribe(true);
                  }}
                  className="w-full bg-[#11456B] text-white text-sm font-bold py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                >
                  Get Started — {viewingFeatures.price}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function getBorderColor(index: number) {
  const borders = [
    "border-[#C8C8C8]",
    "border-[#B0C4D4]",
    "border-[#C8C8A0]",
    "border-[#F0B48A]",
    "border-[#A0D4A8]",
  ];
  return borders[index] ?? "";
}

function PricingCard({
  props,
  setPlan,
  onLearnMore,
  index,
}: {
  props: PricingObjects;
  setPlan: (plan: PricingObjects) => void;
  onLearnMore: (plan: PricingObjects) => void;
  index: number
}) {
  return (
    <div className={`classes.cardContainer h-fit`}>
      {props.popular && <p className={classes.popularCap}>Popular</p>}
      <div
        className={`${classes.smallCard} ${props.bigBox ? classes.bigCard : ""} ${props.popular ? classes.popularCard : ""} pt-4 pb-2`}
      >
        <h4
          style={props.popular ? { color: "#fff" } : {}}
           className={`${classes.h4} ${classes[`planBg${index}`]} ${classes[`planText${index}`]} px-3 py-1 rounded-full border ${getBorderColor(index)} font-semibold`}
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

        <div className="flex flex-col items-center gap-2 w-full">
          <button
            onClick={() => {
              if (props.prompt === "Contact Us") return;
              setPlan(props);
            }}
            className={`${classes.cardPromptBtn} ${props.popular ? classes.popularPromptBtn : ""} ${props.prompt === "Contact Us" ? classes.contactUsPromptBtn : ""}`}
          >
            {props.prompt}
          </button>

          <button
            onClick={() => onLearnMore(props)}
            style={props.popular ? { color: "#cbd5e1" } : { color: "#11456B" }}
            className="text-xs flex items-center gap-x-1 text-[#11456B]  hover:opacity-70 transition-opacity"
          >
            Learn more
           <IoMdInformationCircle className="text-[#11456B]" />
          </button>
        </div>
      </div>
    </div>
  );
}
