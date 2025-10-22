"use client";
import { useState, useRef, useEffect, useContext } from "react";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import UserContext from "@/app/context/userContext/userContext";

export default function OtpInput() {
  const userContext = useContext(UserContext);
  const api = UseAxios();
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [loading,setLoading] = useState(false);
  const OTP_EXPIRY_SECONDS = 180;

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (/[^0-9]/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const finalOtp = otp.join("");
    if (otp.some((digit) => digit === "" || finalOtp.length < 6)) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    console.log("OTP submitted:", finalOtp);
    try {
      setLoading(true);
      const body = {email,otp:finalOtp};
      const res = await api.post("auth/otp",body);
      if (res.status === 200) {
        localStorage.setItem("soundmacToken",res.data.token);
        userContext?.setUser(res.data.user);
        const redirect = localStorage.getItem("soundmacRedirectAfterOtp");
        router.push(redirect|| "/dashboard?tab=dashboard?section=''");
        localStorage.removeItem("soundmacPendingEmail");
        localStorage.removeItem("soundmacotpExpiry");
        localStorage.removeItem("soundmacRedirectAfterOtp");
        toast.success(res.data.msg);
      }
    } catch (error) {
      if (error instanceof AxiosError){
        console.log(error);
        return;
      }
      toast.error(error as string);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("soundmacPendingEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // optional: redirect back if there's no stored email
      // window.location.href = "/register";
    }
  }, []);

  useEffect(() => {
    const storedExpiry = localStorage.getItem("soundmacotpExpiry");

    let expiryTime: number;
    if (storedExpiry) {
      expiryTime = parseInt(storedExpiry);
    } else {
      expiryTime = Date.now() + OTP_EXPIRY_SECONDS * 1000;
      localStorage.setItem("soundmacotpExpiry", expiryTime.toString());
    }

    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.floor((expiryTime - Date.now()) / 1000)
      );
      setTimer(secondsLeft);
      if (secondsLeft === 0) {
        setCanResend(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canResend]);
  const handleResend = async() => {
    try {
      setLoading(true);
      if(!email){
        toast.error("No email found to resend OTP.");
        return;
      }
      const body = {email};
      const res = await api.patch("auth/otp",body);
      if (res.statusText === "OK") {
        toast.success(res.data.msg);
        const newExpiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;
        localStorage.setItem("soundmacotpExpiry", newExpiry.toString());
        setCanResend(false);
        setTimer(OTP_EXPIRY_SECONDS);
      }
    } catch (error) {
      if (error instanceof AxiosError){
        console.log(error);
        return;
      }
      toast.error(error as string);
    }finally{
      setLoading(false);
    }
  };
  function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
  return (
    <>
            <div className="w-[70%] mx-auto text-center max-sm:w-[90%]">
          <h1 className="text-primary font-extrabold text-4xl leading-10 tracking-[0.5px] max-lg:text-2xl">
            {" "}
            Verify Your Account
          </h1>
          <p className="text-p font-normal text-sm leading-5 tracking-[0.5px] mt-3">
            We’ve sent a 6-digit code to{" "}
            <span className="text-[#708FA6]">{email}</span>{" "}
            Enter the code below to confirm your account..
          </p>
          <div className="border-2 border-dashed border-[#E1E1CF] my-10"></div>
        </div>
    <div className="flex flex-col items-center gap-10 w-[60%] mx-auto max-mobile:w-[80%] max-sm:w-full">

      <div className="flex gap-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            disabled={loading}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="bg-transparent w-10 h-10 text-center text-xl border-2 border-gray-400 rounded-lg focus:outline-none focus:border-primary"
          />
        ))}
      </div>
      <button
      disabled={loading}
        onClick={handleSubmit}
        className={"bg-primary w-[20%] text-white font-semibold py-2 rounded-lg hover:bg-primary/80 transition hover:cursor-pointer" + ( loading && " bg-disable")}
      >
        Verify
      </button>
      <div>

      <p className="text-p/90 font-light text-sm">
        Didn&apos;t receive the otp?
        <button
          disabled={!canResend || loading}
          onClick={handleResend}
          className={"underline text-primary hover:cursor-pointer hover:text-primary/80 " + ( (!canResend || loading) && " text-[#CFDAE1] hover:cursor-default" )}
        >
          Resend
        </button>{" "}
      </p>

      <p className="text-[#A4A4A4] text-center mt-4 font-bold">
        {formatTime(timer)}

      </p>
      </div>
    </div>
    </>
  );
}
