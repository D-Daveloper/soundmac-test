"use client";
import { useState } from "react";
import DashboardContext from "./dashboardContext";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { useTabQuery } from "../../../util/customHooks/useTabQuery";

// Assuming DashboardContext is typed as above
const DashboardState = ({ children }: { children: React.ReactNode }) => {
  const { deleteParam } = useTabQuery();
  const { data } = useAuthUser();
  const [layoutHeaderMessage, setLayoutHeaderMessage] = useState("");
  const [openUpgradePopUp, setOpenUpgradePopUp] = useState(false);
  const [header, setHeader] = useState<{
    title: string;
    showBackButton: boolean;
    onBack?: () => void;
  }>({
    title: "",
    showBackButton: false,
    onBack: undefined,
  });

  const contextValue = {
    isPremium: data?.premium || false,
    layoutHeaderMessage,
    setLayoutHeaderMessage,
    openUpgradePopUp,
    setOpenUpgradePopUp,
    header,
    setHeader,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardState;
