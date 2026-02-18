"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import React, { useContext, useEffect } from "react";
import AccountInfo from "./AccountInfo";
import PaymentForm from "./Payment_Billlings";
const profileInfoButtons = [
  {
    title: "Profile info",
    query: "profile-info",
  },
  {
    title: "Payments & Billings",
    query: "payments",
  },
  {
    title: "Verification",
    query: "verification",
  },
  {
    title: "Account Settings",
    query: "account-settings",
  },
];
const page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const info = getParam("info");

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Account Informartion");
  }, []);

  //   useEffect(() => {
  //     let header_text = "";
  //     switch (info) {
  //       case "account-informartion":
  //         header_text = "Account Informartion";
  //         break;
  //       case "subscription":
  //         header_text = "Subscription";
  //         break;
  //       case "help":
  //         header_text = "Help & Support";
  //         break;

  //       default:
  //         header_text = "Account Informartion";

  //         break;
  //     }
  //     dashboardContext?.setLayoutHeaderMessage(header_text);
  //   }, []);

  return (
    <div className="bg-main-white h-full w-full flex flex-col lg:pl-[260px] px-5">
      <div className="flex gap-3 mt-5 flex-wrap">
        {profileInfoButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setParam("info", button.query)}
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
      {!info || (info === "profile-info" && <AccountInfo />)}
      {(info === "payments" && <PaymentForm />)}
    </div>
  );
};

export default page;
