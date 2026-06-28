"use client";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense, useContext, useEffect, useState } from "react";
import SideBarCom from "../components/sideBarAdmin/sideBarCom";
import DashboardContext from "../context/dashboardContext/dashboardContext";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, LockKeyhole } from "lucide-react";
import { NormalLoadingScreen } from "../components/Loader/loader";
import { useAuthUser } from "@/util/customHooks/useQueries";
import AdminRoute from "../protectedRoute/AdminProtectedRoute";
import LogoutButton from "../logout/Logout";

const sidebarComponents = [
  {
    title: "music",
    list: [
      {
        title: "All Releases",
        icon: "/add.svg",
        href: "/dashboardAdmin/music/all-releases/single",
        query: "upload",
      },
      {
        title: "Release Requests",
        icon: "/musiclibrary2.svg",
        href: "/dashboardAdmin/music/release-requests/single",
        query: "manageRelease",
      },
    ],
  },
  {
    title: "artist",
    list: [
      {
        title: "All Artists",
        icon: "/add.svg",
        href: "/dashboardAdmin/artist/all-artists?artistStatus=active",
        query: "create",
      },
      {
        title: "All Labels",
        icon: "/profile2user.svg",
        href: "/dashboardAdmin/artist/all-labels?labelStatus=active",
        query: "manageArtist",
      },
      {
        title: "Smartlink Requests",
        icon: "/likeshapes.svg",
        href: "",
        query: "collaboration",
      },
      {
        title: "Collaborations",
        icon: "/likeshapes.svg",
        href: "",
        query: "collaboration",
      },
    ],
  },
  {
    title: "users",
    list: [
      {
        title: "Manage Users",
        icon: "/people.svg",
        href: "/dashboardAdmin/users/manage-users?userStatus=active",
        query: "song",
      },
      {
        title: "Verification Requests",
        icon: "/musicplay.svg",
        href: "/dashboardAdmin/users/verification-requests",
        query: "song",
      },
      {
        title: "Collaborator Accounts",
        icon: "/musicplay.svg",
        href: "",
        query: "song",
      },
      {
        title: "Support Requests",
        icon: "/musicplay.svg",
        href: "/dashboardAdmin/users/support-requests?supportStatus=all",
        query: "song",
      },
    ],
  },
  {
    title: "finance",
    list: [
      {
        title: "sales report",
        icon: "/musicplay.svg",
        href: "/dashboardAdmin/finance/sales-report",
        query: "sales_report",
      },
      {
        title: "withdrawal requests",
        icon: "/musicplay.svg",
        href: "/dashboardAdmin/finance/withdrawal-requests?withdrawalStatus=all",
        query: "sales_report",
      },
    ],
  },
  {
    title: "More",
    list: [
      {
        title: "Promotions",
        icon: "/musicplay.svg",
        href: "/dashboardAdmin/more/promotions?promotionStatus=all",
        query: "sales_report",
      },
      {
        title: "Chart Registrations",
        icon: "/musicplay.svg",
        href: "/dashboardAdmin/more/chart-registrations?chartStatus=all",
        query: "sales_report",
      },
    ],
  },
];
const profileLinks = [
  {
    title: "Help & Support",
    href: "/dashboardAdmin/help",
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

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useAuthUser();
  const dashboardContext = useContext(DashboardContext);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfilePopUpOpen, setIsProfilePopUpOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setIsProfilePopUpOpen(false);
  }, [pathname]);
  if (isLoading || !data) return <NormalLoadingScreen />;
  return (
    <AdminRoute>
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
              <div className="bg-neutral-900 py-10 pb-30 w-full text-main-white! remove-scrollbar">
                <div className="flex flex-col gap-12 ml-6 mr-2 overflow-y-auto min-h-screen h-full remove-scrollbar">
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
                        "font-extralight flex gap-3 w-full px-4 py-2 rounded-lg hover:cursor-pointer focus:bg-neutral-700/90 hover:bg-neutral-700/90 transition-all duration-300 " +
                        (pathname.endsWith("dashboardAdmin") &&
                          " bg-neutral-700")
                      }
                      href={"/dashboardAdmin"}
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
                      key={index}
                      title={component.title}
                      list={component.list}
                    />
                  ))}
                  <div className="mt-30"></div>
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
                  "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm  bg-transparent border-2 border-neutral-500 text-[#494949]"
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
          <LogoutButton />
        </div>
        <Suspense fallback={<NormalLoadingScreen />}>{children}</Suspense>
      </div>
    </AdminRoute>
  );
};

export default Layout;
