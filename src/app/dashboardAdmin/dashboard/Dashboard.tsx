"use client";
import {
  useAuthUser,
  useGetAdminDashboard,
} from "@/util/customHooks/useQueries";
import Image from "next/image";
import { useContext, useEffect } from "react";
import DashboardContext from "../../context/dashboardContext/dashboardContext";
import ReleaseComp from "./ReleaseComp";

const Dashboard = () => {
  const { data, isLoading, isError, error } = useGetAdminDashboard();
  const { data: user } = useAuthUser();
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Welcome, " + user?.firstName);
  }, [dashboardContext, data]);

  return (
    <div className="flex flex-col gap-5 w-full p-5 min-h-screen">
      <div className="grid grid-cols-4 max-sm:grid-cols-1 gap-5 w-full h-full">
        <div
          className={
            " bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[200px] w-full col-span-2 " +
            (isLoading && " shimmer")
          }
        >
          {/* total releases  */}
          <div className={"capitalize p-3 h-full " + (isLoading && " hidden")}>
            <div className="flex flex-col justify-around h-full ">
              <div className="flex justify-between">
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className=" w-auto h-auto"
                />
                <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body">
                  {data?.totalRelease || "0"}
                </h2>
              </div>
              <p className="text-text-disable text-end font-normal leading-[20px] tracking-[-0.5px] text-lg">
                Total Releases
              </p>
              <div className="flex gap-5 w-full">
                <div className="text-center border border-neutral-100 bg-success-50 rounded-lg w-full py-1">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-tighter text-main-heading">
                    {data?.totalApprovedReleases || 0}
                  </h3>
                  <p className="text-text-disable font-bold leading-[18px] tracking-[-0.5px] text-sm">
                    Approved
                  </p>
                </div>
                <div className="text-center border border-neutral-100 bg-warning-100 rounded-lg w-full py-1">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-tighter text-main-heading">
                    {data?.totalPendingReleases || 0}
                  </h3>
                  <p className="text-text-disable font-bold leading-[18px] tracking-[-0.5px] text-sm">
                    Pending
                  </p>
                </div>
                <div className="text-center border border-neutral-100 bg-error-50 rounded-lg w-full py-1">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-tighter text-main-heading">
                    {data?.totalRejectedReleases || 0}
                  </h3>
                  <p className="text-text-disable font-bold leading-[18px] tracking-[-0.5px] text-sm">
                    Rejected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* total users */}
        <div
          className={
            "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[200px] w-full col-span-[1.25] " +
            (isLoading && " shimmer")
          }
        >
          <div
            className={
              "capitalize flex flex-col gap-3 h-full justify-start " +
              (isLoading && " hidden")
            }
          >
            <div className="flex justify-between items-start h-fit">
              <Image
                src={"/people.svg"}
                priority={false}
                height={50}
                width={50}
                alt="people icon"
              />
              <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit truncate">
                {data?.totalUsers || 0}
              </h2>
            </div>
            <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-md w-full flex-1 text-end">
              Registered Users
            </p>
          </div>
        </div>

        {/* total earnings */}
        <div
          className={
            "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[200px] w-full col-span-[1.25] " +
            (isLoading && " shimmer")
          }
        >
          <div
            className={
              "capitalize flex flex-col gap-3 h-full justify-between " +
              (isLoading && " hidden")
            }
          >
            <Image
              src={"/money-icon.png"}
              priority={false}
              height={50}
              width={53}
              alt="money icon"
            />
            <div className="flex flex-col">
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                Total Earnings
              </p>
              <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end truncate">
                ₦{data?.totalEarnings || 0}
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-5 max-sm:flex-col">
        <div
          className={
            "bg-neutral-50 border rounded-3xl border-neutral-100 w-full h-[450px] flex-2/3 p-3 " +
            (isLoading && " shimmer")
          }
        >
          <h4
            className={
              "text-text-disable font-normal leading-[18px] tracking-tighter text-md w-full " +
              (isLoading && " hidden")
            }
          >
            Next Releases
          </h4>
          {data && data.upcomingReleases.length > 0 ? (
            <div
              className={"flex flex-col gap-5 mt-5 " + (isLoading && " hidden")}
            >
              {data?.upcomingReleases.map((item, index) => (
                <ReleaseComp key={index} {...item} />
              ))}
            </div>
          ) : (
            <div
              className={
                "flex flex-col justify-center items-center gap-5 h-full " +
                (isLoading && " hidden")
              }
            >
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
                No upcoming Release.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-1/3 gap-3">
          {/* Created Artists */}
          <div
            className={
              "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[170px] w-full col-span-[1.25] " +
              (isLoading && " shimmer")
            }
          >
            <div
              className={
                "capitalize flex flex-col gap-3 h-full justify-between " +
                (isLoading && " hidden")
              }
            >
              <Image
                src={"/microphone-2.svg"}
                priority={false}
                height={50}
                width={50}
                alt="micro phone icon"
              />
              <div>
                <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end truncate">
                  {data?.totalArtists || 0}
                </h2>
                <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-md w-full text-end">
                  Created Artists
                </p>
              </div>
            </div>
          </div>
          {/* Support Requests */}
          <div
            className={
              "flex-1 bg-neutral-50 border-[1px] rounded-3xl p-3 border-neutral-100 h-[170px] w-full col-span-[1.25] " +
              (isLoading && " shimmer")
            }
          >
            <div
              className={
                "capitalize flex flex-col gap-3 h-full justify-between " +
                (isLoading && " hidden")
              }
            >
              <Image
                src={"/24-support.svg"}
                priority={false}
                height={50}
                width={50}
                alt="support icon"
              />
              <div>
                <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end truncate">
                  {data?.totalSupportRequests || 0}
                </h2>
                <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-md w-full text-end">
                  Support Requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
