'use client'

import { useState } from "react";
import InformationContext from "./informationContext";
import { TOAST_OBJECT } from "../components/toast/types";

const InformationState = ({ children }: { children: React.ReactNode }) => {
  // Define state(s) to pass via context
  const [toasts, setToasts] = useState<TOAST_OBJECT[]>([]);

  const addToast = (type: string, title:string, message:string, duration = 5000) => {
    const newToast = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      duration
    };
    setToasts(prev => [...prev, newToast]);
  };


  const removeToast = (id:number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };


  return (
    <InformationContext.Provider
      value={{
        toasts,
        setToasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </InformationContext.Provider>
  );
};

export default InformationState;
