"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";


export function useTabQuery(defaultTab = "dashboard") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = searchParams.get("tab") || defaultTab;
  const section = searchParams.get("section");
  const promotionType = searchParams.get("promotionType");

    // 2. Update the URL when the user changes the search or page
  const handleUpdateParams = (newQuery: string, newPage: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) params.set('query', newQuery);
    else params.delete('query');

    if (newPage) params.set('page', newPage);
    else params.delete('page');

    // Update the URL without a full page reload
    router.push(`${pathname}?${params.toString()}`);
  };

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

  return { tab, section,setParam,getParam,deleteParam,promotionType,handleUpdateParams };
}
