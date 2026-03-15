"use client";
import { useEffect, useState } from "react";
import classes from "./loader.module.css";
import { LOADER } from "./types";
import Image from "next/image";
import logo from "../../../assets/images/soundmacsLogo.png";

export default function Loader(params: LOADER) {
  return (
    <div
      style={params?.color ? { borderRightColor: params.color } : {}}
      className={classes.loader}
    ></div>
  );
}

export function LoadingScreen() {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000); // Reduced from 200000000 to 2000ms (2 seconds)

    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) return null;

  return (
    <div className={classes.loadingOverlay}>
      <div className={classes.logoContainer}>
        <Image
          src={logo}
          alt="Soundmac's Logo"
          className={classes.logo}
          width={200}
          height={200}
        />
      </div>
    </div>
  );
}

export function NormalLoadingScreen() {
  return (
    <div className={classes.loadingOverlay}>
      <div className={classes.logoContainer}>
        <Image
          priority={true}
          src={logo}
          alt="Soundmac's Logo"
          className={classes.logo}
          width={200}
          height={200}
        />
      </div>
    </div>
  );
}

export function InlineLoadingScreen() {
  return (
    <div className="flex  justify-center items-center h-full min-h-[90dvh]">
      <Image
        priority={true}
        src={logo}
        alt="Soundmac's Logo"
        className={"animate-spin"}
        width={100}
        height={100}
      />
    </div>
  );
}
export function ModelLoadingScreen() {
  return (
    <div className="flex justify-center items-center min-h-full!">
      <Image
        priority={true}
        src={logo}
        alt="Soundmac's Logo"
        className={"animate-spin"}
        width={100}
        height={100}
      />
    </div>
  );
}
