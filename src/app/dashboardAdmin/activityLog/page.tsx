"use client";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import AdminListView from "./adminListView";
import ActivityLogTable from "./activityLogTable";
import { useContext, useEffect } from "react";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const Page = () => {
    const dashboardContext = useContext(DashboardContext);
  
  const { data: authUser, isLoading } = useAuthUser();

   useEffect(() => {
      dashboardContext?.setHeader({title:"My Activity", showBackButton:true });
    }, []);

  if (isLoading || !authUser) return <InlineLoadingScreen />;

  return authUser.role === "super_admin" ? (
    <AdminListView />
  ) : (
    <ActivityLogTable adminId={authUser._id.toString()} />
  );
};

export default Page;