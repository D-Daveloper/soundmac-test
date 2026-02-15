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

export default function Pricing() {
  const api = UseAxios();
  const [wantsToSubscribe, setWantsToSubscribe] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, SetSelectedPlan] = useState<null | PricingObjects>(null);
  const [email, setEmail] = useState("");

  const subscribe = async (plan: string, email: string) => {
    try {
      setIsSubscribing(true);
      const res = await api.post(
        "/payments",
        JSON.stringify({ email: email, plan }),
      );
      toast.info("You will be redirected now.");
      window.location.href = res.data.url;
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      } else {
        console.error("payment error", error);
        toast.error("Something went wrong.");
      }
    } finally {
      setIsSubscribing(false);
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
          </div>
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
              Proceed to Payment
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
