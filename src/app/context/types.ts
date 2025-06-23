import React from "react";
import { TOAST_OBJECT } from "../components/toast/types";


export interface INFORMATION_CONTEXT {
    toasts: TOAST_OBJECT[]
    setToasts: React.Dispatch<React.SetStateAction<TOAST_OBJECT[]>>
    addToast: (type: string, title: string, message: string, duration?: number) => void
    removeToast: (id: number) => void
}

