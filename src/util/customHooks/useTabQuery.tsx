"use client";

import { useSearchParams, useRouter } from "next/navigation";
const sections = {
    upload:{tab:"Music",section:"uploadMusic"},
    manageRelease:{tab:"Music",section:"manageReleases"},
    create:{tab:"Artist",section:"createArtist"},
    manageArtist:{tab:"Artist",section:"manageArtist"},
    collaboration:{tab:"Artist",section:"collaboration"},
    song:{tab:"Insight",section:"songPerformance"},
    // create:{tab:"Artist",section:"createArtist"},
}
/**
 * A simple helper hook for managing tab & section state via URL query parameters.
 */
export function useTabQuery(defaultTab = "dashboard") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab = searchParams.get("tab") || defaultTab;
  const section = searchParams.get("section");

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
            params.set("tab",sections.upload.tab);
            params.set("section",sections.upload.section);
            router.push(`?${params.toString()}`, { scroll: false })
            break;
        case "manageRelease":
            params.set("tab",sections.manageRelease.tab);
            params.set("section",sections.manageRelease.section);
            router.push(`?${params.toString()}`, { scroll: false })
            break;
        case "create":
            params.set("tab",sections.create.tab);
            params.set("section",sections.create.section);
            router.push(`?${params.toString()}`, { scroll: false })
            break;
        case "manageArtist":
            params.set("tab",sections.manageArtist.tab);
            params.set("section",sections.manageArtist.section);
            router.push(`?${params.toString()}`, { scroll: false })
            break;
        case "collaboration":
            params.set("tab",sections.collaboration.tab);
            params.set("section",sections.collaboration.section);
            router.push(`?${params.toString()}`, { scroll: false })
            break;
        case "song":
            params.set("tab",sections.song.tab);
            params.set("section",sections.song.section);
            router.push(`?${params.toString()}`, { scroll: false })
            break;
    
        default:
            params.set("tab","dashboard")
            break;
    }
  };

  return { tab, section, setTab, setSection };
}
