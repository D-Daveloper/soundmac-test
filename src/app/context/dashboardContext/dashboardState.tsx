'use client'
import { useState } from "react";
import DashboardContext from "./dashboardContext";

// Assuming DashboardContext is typed as above
const DashboardState = ({ children }: { children: React.ReactNode }) => {
    const [layoutHeaderMessage, setLayoutHeaderMessage] = useState("");

    const contextValue = {
        layoutHeaderMessage,
        setLayoutHeaderMessage,
    };

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardState;