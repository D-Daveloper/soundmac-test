"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import React, { useContext, useEffect, useState } from "react";
import AccountInfo from "./AccountInfo";
import PaymentForm from "./Payment_Billlings";
import ScrollableTabs from "./Buttons";
import Verification from "./Verification";
import AccountSettings from "./AccountSettings";
const profileInfoButtons = [
  {
    label: "Profile info",
    query: "profile-info",
  },
  {
    label: "Payments & Billings",
    query: "payments",
  },
  {
    label: "Verification",
    query: "verification",
  },
  {
    label: "Account Settings",
    query: "account-settings",
  },
];
const page = () => {
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const [active,setActive] = useState<number>(0);
  const info = getParam("info");

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Account Informartion");
  }, []);

  useEffect(() => {
    if (info) {
      const index = profileInfoButtons.findIndex((tab) => tab.query === info);
      if (index !== -1) {
        setActive(index);
      }
    }
  }, [info]);

  return (
    <div className="bg-main-white h-full w-full flex flex-col lg:pl-[300px] px-5">
      <div className="flex gap-3 mt-5 flex-wrap">
       <ScrollableTabs tabs={profileInfoButtons} onChange={(index)=>{setParam("info",profileInfoButtons[index].query)}} active={active}/>
      </div>
      {!info || (info === "profile-info" && <AccountInfo />)}
      {(info === "payments" && <PaymentForm />)}
      {(info === "verification" && <Verification />)}
      {(info === "account-settings" && <AccountSettings />)}
    </div>
  );
};

export default page;
