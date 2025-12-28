"use client";

import { useSearchParams, useRouter } from "next/navigation";
const sections = {
  upload: { tab: "Music", section: "uploadMusic" },
  manageRelease: { tab: "Music", section: "manageReleases" },
  create: { tab: "Artists", section: "createArtist" },
  manageArtist: { tab: "Artists", section: "manageArtist" },
  collaboration: { tab: "Artists", section: "collaboration" },
  song: { tab: "Insights", section: "songPerformance" },
  promotion: { tab: "explore", section: "promotion" },
  // create:{tab:"Artist",section:"createArtist"},
};

export function useTabQuery(defaultTab = "dashboard") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = searchParams.get("tab") || defaultTab;
  const section = searchParams.get("section");
  const promotionType = searchParams.get("promotionType");
  
  const setTab = (newTab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    params.delete("section"); // reset section when switching main tab
    router.push(`?${params.toString()}`, { scroll: false });
};

  const setSection = (newSection: string) => {
    console.log(newSection);

    const params = new URLSearchParams(searchParams);
    switch (newSection) {
      case "upload":
        params.set("tab", sections.upload.tab);
        params.set("section", sections.upload.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;
      case "manageRelease":
        params.set("tab", sections.manageRelease.tab);
        params.set("section", sections.manageRelease.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;
      case "create":
        params.set("tab", sections.create.tab);
        params.set("section", sections.create.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;
      case "manageArtist":
        params.set("tab", sections.manageArtist.tab);
        params.set("section", sections.manageArtist.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;
      case "collaboration":
        params.set("tab", sections.collaboration.tab);
        params.set("section", sections.collaboration.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;
      case "song":
        params.set("tab", sections.song.tab);
        params.set("section", sections.song.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;
      case "promotion":
        params.set("tab", sections.promotion.tab);
        params.set("section", sections.promotion.section);
        router.push(`?${params.toString()}`, { scroll: false });
        break;

      default:
        params.set("tab", "dashboard");
        break;
    }
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

  return { tab, section, setTab, setSection,setParam,getParam,deleteParam,promotionType };
}
