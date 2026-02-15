'use client'
import { useState } from "react";
import DashboardContext from "./dashboardContext";
import { useAuthUser } from "@/util/customHooks/useQueries";

// Assuming DashboardContext is typed as above
const DashboardState = ({ children }: { children: React.ReactNode }) => {
    const {data} = useAuthUser();
    const [layoutHeaderMessage, setLayoutHeaderMessage] = useState("");
    const [openUpgradePopUp, setOpenUpgradePopUp] = useState(false);

    const contextValue = {
        isPremium:data?.premium || false,
        layoutHeaderMessage,
        setLayoutHeaderMessage,
        openUpgradePopUp,
        setOpenUpgradePopUp
    };

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardState;