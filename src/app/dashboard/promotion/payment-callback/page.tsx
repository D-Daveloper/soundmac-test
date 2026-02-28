"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { toast } from "react-toastify";
import UseAxios from "@/util/customHooks/UseAxios";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";

const page = () => {
  const router = useRouter();
  const api = UseAxios();
  const { getParam } = useTabQuery();
  const reference = getParam("reference");
const hasCalled = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
          if (hasCalled.current) return; // prevent second call
    hasCalled.current = true;
      try {
        if (!reference) {
          router.push("/dashboard/promotion?page=myPromotions");
          return;
        }
        const res = await api.patch("promotions",JSON.stringify({reference}));
        toast.success(res.data.msg);
        router.push("/dashboard/promotion?page=myPromotions");
      } catch (error) {
        toast.error("Payment Verification Failed");
      }
    };
    verifyPayment();
  }, [reference]);

  return (
    <div>
      <Loading />
    </div>
  );
};

export default page;
