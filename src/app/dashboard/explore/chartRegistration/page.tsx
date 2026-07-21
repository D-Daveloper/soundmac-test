"use client";
import React, { useContext, useEffect } from "react";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Link from "next/link";
import ChartCard from "./ChartCard";
import { chartRegistrationConstants } from "@/app/constant";

const Page = () => {

 const dashboardContext = useContext(DashboardContext);
    useEffect(() => {
      dashboardContext?.setHeader({title:"Chart Registration", showBackButton:false});
    }, []);

  return (
    <div className="bg-main-white w-full flex flex-col pb-20">
      <div className="flex gap-3 mt-5">
        <Link
          href={"/dashboard/explore/chartRegistration"}
          className={
            " font-bold rounded-xl text-center max-w-fit px-5 h-10 flex items-center justify-center w-full hover:cursor-pointer text-sm ml-5 bg-primary hover:bg-primary/90 text-white!"
          }
        >
          Explore
        </Link>
        <Link
          href={"/dashboard/explore/chartRegistration/myRegistrations"}
          className={
            " font-bold rounded-xl text-center max-w-fit px-5 h-10 flex items-center justify-center hover:cursor-pointer hover:bg-primary-500/20 text-sm bg-transparent border-2 border-text-disable text-text-disable"
          }
        >
         My Registrations
        </Link>
      </div>
      <div className="px-5 my-10">
        <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm lg:max-w-[60%] text-left">
          Register your release to meet global chart requirements with verified
          metadata, eligibility checks, and accurate tracking support.
        </p>
        <div className="mt-10 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
          {chartRegistrationConstants.map((item, index) => (
            <ChartCard
              key={index}
              title={item.title}
              description={item.description}
              amount={item.amount}
              country={item.country}
              slug={item.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
