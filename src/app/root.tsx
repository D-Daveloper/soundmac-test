'use client'
import { useContext } from "react";
import { Footer } from "./components/footer/footer";
import Header from "./components/header/header";
import { LoadingScreen } from "./components/Loader/loader";
import { cssStyles } from "./components/toast/constants";
import ToastContainer from "./components/toast/toast";
import InformationContext from "./context/informationContext";

export default function Root({ children }: Readonly<{
    children: React.ReactNode;
}>) {

    const informationContext = useContext(InformationContext)
    const nullFunction = ()=>{}
    return (
        <>
            <style>{cssStyles}</style>
            <ToastContainer toasts={informationContext?.toasts || []} onRemoveToast={informationContext?.removeToast || nullFunction} />
            <LoadingScreen />
            <Header />
            {children}
            <Footer />
        </>
    )
}