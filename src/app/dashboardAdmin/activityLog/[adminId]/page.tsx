"use client";
import { useParams } from "next/navigation";
import ActivityLogTable from "../activityLogTable";
import { useContext, useEffect } from "react";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const Page = () => {
const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
        dashboardContext?.setHeader({title:"My Activity", showBackButton:true });
      }, []);
  const params = useParams();
  const adminId = params.adminId as string;

  return <ActivityLogTable adminId={adminId} />;
};

export default Page;