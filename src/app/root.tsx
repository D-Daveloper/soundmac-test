'use client'
import { useContext } from "react";
import { Footer } from "./components/footer/footer";
import Header from "./components/header/header";
import { LoadingScreen } from "./components/Loader/loader";
import { cssStyles } from "./components/toast/constants";
import ToastContainer from "./components/toast/toast";
import { usePathname } from "next/navigation";
import { portalScreens, rootScreenLinks } from "./utils/constants";
import InformationContext from "./context/informationContext/informationContext";
import SideBar from "./components/sideBar/sideBar";

export default function Root({ children }: Readonly<{children: React.ReactNode;}>) {
    const pathname = usePathname();
    const informationContext = useContext(InformationContext)
    const nullFunction = () => { }
    return (
        <>
            <style>{cssStyles}</style>
            <ToastContainer toasts={informationContext?.toasts || []} onRemoveToast={informationContext?.removeToast || nullFunction} />
            <LoadingScreen />
            {rootScreenLinks.includes(pathname) && <Header />}
            {portalScreens.includes(pathname) && <SideBar />}
            {children}
            {rootScreenLinks.includes(pathname) && <Footer />}
        </>
    )
}