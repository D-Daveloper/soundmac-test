"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Loading from "../loading";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { toast } from "react-toastify";
import UseAxios from "@/util/customHooks/UseAxios";
import { useQueryClient } from "@tanstack/react-query";

const page = () => {
  const router = useRouter();
  const api = UseAxios();
  const { getParam } = useTabQuery();
  const reference = getParam("reference");
  const queryClient = useQueryClient();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!reference) {
          router.push("/pricing");
          return;
        }
        const res = await api.put("/payments",JSON.stringify({reference}));
        toast.success(res.data.msg);
        await queryClient.invalidateQueries({queryKey:["authUser"]});
        router.push("/dashboard");
      } catch (error) {}
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
