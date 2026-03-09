"use client";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import SideBarCom from "../components/sideBarComponents/sideBarCom";
import UserRoute from "../protectedRoute/protectedRoute";
import DashboardContext from "../context/dashboardContext/dashboardContext";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, LockKeyhole } from "lucide-react";
import { NormalLoadingScreen } from "../components/Loader/loader";
import { useAuthUser } from "@/util/customHooks/useQueries";

const sidebarComponents = [
  {
    title: "music",
    list: [
      {
        title: "upload release",
        icon: "/add.svg",
        href: "/dashboard/music/uploadMusic",
        query: "upload",
      },
      {
        title: "manage release",
        icon: "/musiclibrary2.svg",
        href: "/dashboard/music/manageRelease?type=single",
        query: "manageRelease",
      },
    ],
    // isActive: "",
    // setIsActive: () => setIsActive("music"),
  },
  {
    title: "artist",
    list: [
      {
        title: "create artist",
        icon: "/add.svg",
        href: "/dashboard/artist/createArtist",
        query: "create",
      },
      {
        title: "manage artist",
        icon: "/profile2user.svg",
        href: "/dashboard/artist/manageArtist",
        query: "manageArtist",
      },
      {
        title: "collaborations",
        icon: "/likeshapes.svg",
        href: "",
        query: "collaboration",
      },
    ],
    // isActive: "",
    // setIsActive: () => setIsActive("artists"),
  },
  {
    title: "insights",
    list: [
      {
        title: "song performance",
        icon: "/musicplay.svg",
        href: "",
        query: "song",
      },
    ],
    // isActive: "",
    // setIsActive: () => setIsActive("insights"),
  },
  {
    title: "finance",
    list: [
      {
        title: "sales report",
        icon: "/musicplay.svg",
        href: "/dashboard/salesReport",
        query: "sales_report",
      },
    ],
    // isActive: "",
    // setIsActive: () => setIsActive("finance"),
  },
  {
    title: "explore",
    list: [
      {
        title: "promotion",
        icon: "/add.svg",
        href: "/dashboard/promotion?page=explore",
        query: "promotion",
      },
      {
        title: "cover license",
        icon: "/musiclibrary2.svg",
        href: "",
        query: "manageRelease",
      },
    ],
    // isActive: "",
    // setIsActive: () => setIsActive("explore"),
  },
];
const profileLinks = [
  {
    title: "Help & Support",
    href: "/dashboard/help",
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
  },
  {
    title: "Account Information",
    href: "/dashboard/profile?info=profile-info",
  },
];

const layout = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useAuthUser();
  const { tab } = useTabQuery("dashboard");
  const dashboardContext = useContext(DashboardContext);
  const pathname = usePathname();
  const [isActive, setIsActive] = useState<string>(tab);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfilePopUpOpen, setIsProfilePopUpOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setIsProfilePopUpOpen(false);
  }, [pathname]);
  if (isLoading || !data) return <NormalLoadingScreen />;
  return (
    <UserRoute>
      <div className="relative">
        <div className="sticky top-0 z-20">
          <div className="flex gap-5 items-center p-5 outline-1 relative top-0 bg-main-white lg:pl-[250px]">
            <div
              aria-label="side bar nav button"
              role="button"
              className="flex items-center flex-col gap-1 hover:cursor-pointer lg:hidden "
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              <div className="bg-primary w-5 h-1"></div>
              <div className="bg-primary w-5 h-1"></div>
              <div className="bg-primary w-5 h-1"></div>
            </div>
            <h1 className="font-light text-2xl tracking-[-1px] leading-8 capitalize ml-5 h-8">
              {dashboardContext?.layoutHeaderMessage}
            </h1>
            <div
              className={
                " transition-all duration-300 ease-in-out flex h-[100dvh] lg:w-[250px] max-lg:w-[50%] max-sm:w-full absolute top-0 max-lg:top-18 bottom-0 left-0 right-0 " +
                (isOpen
                  ? " max-lg:-translate-x-0"
                  : " max-lg:-translate-x-full")
              }
            >
              <div className="bg-primary-700 py-10 pb-30 w-full text-main-white remove-scrollbar">
                <div className="flex flex-col gap-12 ml-6 mr-2 overflow-y-auto h-full remove-scrollbar">
                  <div className="flex justify-between items-center">
                    <Link
                      href={"/"}
                      className="flex gap-3 items-center opacity-60"
                    >
                      <Image
                        src="/logo.svg"
                        alt="soundmac logo"
                        width={20}
                        height={20}
                      />
                      <h1 className="font-light ">SOUNDMAC</h1>
                    </Link>
                    <button
                      className="bg-primary text-white px-5 py-3 rounded-lg lg:hidden"
                      onClick={() => {
                        setIsOpen(false);
                        setIsProfilePopUpOpen(false);

                        console.log(isOpen);
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div className="flex flex-col gap-5">
                    <Link
                      className={
                        "font-extralight flex gap-3 w-full px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-primary-500/90" +
                        (pathname.endsWith("dashboard") && " bg-primary-500")
                      }
                      href={"/dashboard"}

                      // onClick={() => {
                      //   setIsOpen(false);
                      //   setIsActive("dashboard");
                      //   setTab("dashboard");
                      // }}
                    >
                      <Image
                        src="/home.svg"
                        alt="home logo"
                        width={20}
                        height={20}
                      />
                      Dashboard
                    </Link>
                  </div>
                  {sidebarComponents.map((component, index) => (
                    <SideBarCom
                      isActive={isActive}
                      setIsActive={setIsActive}
                      key={index}
                      title={component.title}
                      list={component.list}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            dashboardContext?.openUpgradePopUp
              ? " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
              : " hidden"
          }
        >
          <div className="flex flex-col gap-5 w-fit py-5 px-5 justify-center items-center bg-neutral-100  rounded-xl shadow-2xl max-w-[350px]">
            <div className="flex flex-col gap-2 mb-2 justify-center items-center">
              <LockKeyhole size={80} color="#999" strokeWidth={2} />
              <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
                Subscription Required{" "}
              </h3>
              <p className="text-p font-normal text-sm leading-4 -tracking-[0.5px] text-center">
                This feature is available only to subscribed users.
                <br /> Pick a plan and start creating with Soundmac.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => dashboardContext?.setOpenUpgradePopUp(false)}
                className={
                  "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm  bg-transparent border-2 border-primary-500 text-[#494949]"
                }
              >
                Not Now
              </button>
              <Link
                href={"/pricing"}
                aria-label="go to pricing page"
                className={
                  "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
                }
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsProfilePopUpOpen(!isProfilePopUpOpen)}
          className={
            "transition-all duration-300 ease-in-out fixed rounded-2xl w-55 h-15 bg-black z-100 top-[90%] left-2 flex p-2 justify-between items-center " +
            (isOpen ? " max-lg:-translate-x-0 " : " max-lg:-translate-x-[110%]")
          }
        >
          <div className="flex">
            <Image
              src={"/boomplay.jpg"}
              width={50}
              height={50}
              alt="profile picture"
              className="rounded-2xl object-cover  "
            />
            <div className="flex flex-col justify-center items-center ml-2">
              <h2 className="font-light text-lg text-white tracking-[-1px] leading-8 capitalize h-8 line-clamp-1">
                {data.firstName}
              </h2>
              <p className="text-primary-300 font-light leading-[18px] -tracking-[-0.5px] text-xs line-clamp-1">
                {data.type}
              </p>
            </div>
          </div>
          <div>
            {isProfilePopUpOpen ? (
              <ChevronDown color="#fff" />
            ) : (
              <ChevronUp color="#fff" />
            )}
          </div>
        </button>
        <div
          className={
            "fixed rounded-2xl w-55 h-55 bg-white z-30 bottom-25 left-2 flex flex-col p-2 justify-between transition-opacity duration-300 " +
            (isProfilePopUpOpen
              ? "opacity-100"
              : " opacity-0 pointer-events-none")
          }
        >
          {profileLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-text-body font-normal leading-[18px] -tracking-[-0.5px] text-sm capitalize p-3 hover:bg-gray-200 rounded-lg"
            >
              {link.title}
            </Link>
          ))}
          <button
            // onClick={() => dashboardContext?.setOpenUpgradePopUp(false)}
            className={
              "px-2 py-2 font-bold rounded-lg max-w-full hover:cursor-pointer text-sm hover:bg-error-400/90 bg-error-400 border-2 border-error-400 text-white text-start"
            }
          >
            Log Out
          </button>
        </div>
        {children}
      </div>
    </UserRoute>
  );
};

export default layout;
