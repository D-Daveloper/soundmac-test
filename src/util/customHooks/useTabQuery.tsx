"use client";

import { useSearchParams, useRouter } from "next/navigation";


export function useTabQuery(defaultTab = "dashboard") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = searchParams.get("tab") || defaultTab;
  const section = searchParams.get("section");
  const promotionType = searchParams.get("promotionType");

  const setParam = (param: string, type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(param, type);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  const getParam = (text: string) => {
    const params = new URLSearchParams(searchParams);
    const param = params.get(text);
    return param;

  };
  const deleteParam = (text: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(text);
    router.push(`?${params.toString()}`, { scroll: false });

  };

  return { tab, section,setParam,getParam,deleteParam,promotionType };
}
