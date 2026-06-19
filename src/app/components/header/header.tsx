"use client";
import Link from "next/link";
import { linkRoutes, navigationLinks } from "../../utils/constants";
import classes from "./header.module.css";
import {useRouter } from "next/navigation";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { Fragment, useContext, useEffect, useState } from "react";
import UserContext from "@/app/context/userContext/userContext";
import { NormalLoadingScreen } from "../Loader/loader";
import { USER } from "@/app/context/userContext/types";
import Image from "next/image";
import soundmacLogo from "@/assets/images/soundmacsLogo.png";

export default function Header() {
  const router = useRouter();
  const userContext = useContext(UserContext);
  const token = userContext?.token;
  // const pathname = usePathname();
  const [modal, setModal] = useState(false);
  const [gettingUser, setGettingUser] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const toggleModal = () => {
    setModal((prev) => !prev);
  };

  const onSuccess = (user: USER) => {
    console.log(user);
    const userRole: string = user?.role;
    const location = linkRoutes.artists[userRole];
    router.push(location);
  };

  const onError = (error: unknown) => {
    userContext?.handleAPIError(error);
  };

  const move = () => {
    userContext?.getUser(setGettingUser, onSuccess, onError);
  };

  return (
    <header
      className={`${classes.container} ${modal ? classes.containerActive : ""}`}
    >
      {gettingUser && <NormalLoadingScreen />}
      <div className="w-full flex justify-between items-center md:w-auto md:contents">

      <GiHamburgerMenu
        onClick={toggleModal}
        className={classes.hamburgerIcon}
      />
      <div className="flex items-center gap-x-2 ">
        <Image src={soundmacLogo} alt="Company Logo" width={30} height={30} className="w-5 h-5 md:w-[30px] md:h-[30px] " />
        <Link href={"#home"} className={classes.logo}>
          S O U N D M A C
        </Link>
      </div>
      </div>
      {modal && <div className={classes.overlay} />}
      <nav
        className={`${classes.navGroup} ${!modal ? classes.navGroupInactive : ""}`}
      >
        <IoMdClose onClick={toggleModal} className={classes.hamburgerIcon} />
        {navigationLinks.map((nav, index) => (
          <Fragment key={index}>
            <a
              href={nav.link}
              onClick={toggleModal}
              className={`${classes.link} ${
                activeSection === nav.link.replace("#", "")
                  ? classes.activeLink
                  : ""
              }`}
            >
              {nav.name}
            </a>
            {/* <Link onClick={toggleModal} className={`${classes.link} ${pathname === nav.link ? classes.activeLink : ''}`} href={nav.link} >{nav.name}</Link> */}
            <div className={classes.mobileHorizontalLine} />
          </Fragment>
        ))}
        {token ? (
          <button
            onClick={move}
            className={`${classes.loginBtn} ${classes.loginBtn}`}
          >
            Dashboard
          </button>
        ) : (
          <>
            <Link href={linkRoutes.SignIn} className={classes.loginBtn}>
              Login
            </Link>
            <div className={classes.mobileHorizontalLine} />
            <Link
              href={linkRoutes.SignUp}
              className={`${classes.loginBtn} ${classes.registerBtn}`}
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
