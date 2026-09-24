"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useTabQuery(defaultTab = "dashboard") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = searchParams.get("tab") || defaultTab;
  const section = searchParams.get("section");
  const promotionType = searchParams.get("promotionType");

  // If value is an empty string, undefined, or null, it deletes the parameter
  const handleUpdateParams = (
    updates: Record<string, string | undefined | null>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Loop through the object to batch update or delete parameters
    Object.entries(updates).forEach(([name, value]) => {
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name); // Cleans up the URL if value is empty/falsy
      }
    });

    // Update the URL once for all changes
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

  return {
    tab,
    section,
    setParam,
    getParam,
    deleteParam,
    promotionType,
    handleUpdateParams,
  };
}
