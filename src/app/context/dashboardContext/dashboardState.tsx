"use client";
import { useEffect, useState } from "react";
import DashboardContext from "./dashboardContext";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { subscriptionModalStore } from "@/util/store/subscriptionModalStore";

// Assuming DashboardContext is typed as above
const DashboardState = ({ children }: { children: React.ReactNode }) => {
  const { data } = useAuthUser();
  const [layoutHeaderMessage, setLayoutHeaderMessage] = useState("");
  const [openUpgradePopUp, setOpenUpgradePopUp] = useState(false);
  const [showGraceReminder, setShowGraceReminder] = useState(false);

  const [header, setHeader] = useState<{
    title: string;
    showBackButton: boolean;
    onBack?: () => void;
  }>({
    title: "",
    showBackButton: false,
    onBack: undefined,
  });

  useEffect(() => {
    return subscriptionModalStore.subscribe(() => {
      if (subscriptionModalStore.getIsOpen()) {
        setOpenUpgradePopUp(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!data?.subscriptionDetails) return;

    const { subscriptionStatus, graceEndsAt } = data.subscriptionDetails;
    if (subscriptionStatus !== "GRACE_PERIOD" || !graceEndsAt) return;

    const dismissKey = `grace-reminder-seen-${data._id}-${graceEndsAt}`;
    const alreadySeen = localStorage.getItem(dismissKey);

    if (!alreadySeen) {
      setShowGraceReminder(true);
    }
  }, [data]);

   const dismissGraceReminder = () => {
    if (data?.subscriptionDetails?.graceEndsAt) {
      localStorage.setItem(
        `grace-reminder-seen-${data._id}-${data.subscriptionDetails.graceEndsAt}`,
        "true",
      );
    }
    setShowGraceReminder(false);
  };

  const contextValue = {
    isPremium: data?.premium || false,
    layoutHeaderMessage,
    setLayoutHeaderMessage,
    openUpgradePopUp,
    setOpenUpgradePopUp,
    showGraceReminder,
    setShowGraceReminder,
    dismissGraceReminder,
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
