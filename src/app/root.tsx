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
// import styles from './page.module.css'
import UpgradeModal from "./components/upgradeModal/upgradeModal";

export default function Root({ children }: Readonly<{ children: React.ReactNode; }>) {
    const pathname = usePathname();
    const informationContext = useContext(InformationContext)
    const nullFunction = () => { }
    return (
        <>
            <style>{cssStyles}</style>
            <ToastContainer toasts={informationContext?.toasts || []} onRemoveToast={informationContext?.removeToast || nullFunction} />
            <LoadingScreen />
            <UpgradeModal />
            {(rootScreenLinks.includes(pathname) || pathname.includes("/promotion/") || pathname.includes("/blog/")) && <Header />}
            {/* <div className={styles.flexContainer}> */}
                {portalScreens.includes(pathname) && <SideBar />}
                {children}
            {/* </div> */}
            {(rootScreenLinks.includes(pathname) || pathname.startsWith("/promotion/") || pathname.startsWith("/blog/"))  && <Footer />}
        </>
    )
}