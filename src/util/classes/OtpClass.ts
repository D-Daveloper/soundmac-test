import { OtpForm } from "@/app/type";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRef } from "react";
import { toast } from "react-toastify";

export class OTP {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  constructor(
    otp: string[],
    setOtp: React.Dispatch<React.SetStateAction<string[]>>,
    inputsRef: React.RefObject<(HTMLInputElement | null)[]>
  ) {
    this.otp = otp;
    this.setOtp = setOtp;
    this.inputsRef = inputsRef;
  }

  handleChange = (value: string, index: number) => {
    if (/[^0-9]/.test(value)) return; // only digits

    const newOtp = [...this.otp];
    newOtp[index] = value;
    this.setOtp(newOtp);

    // move to next input
    if (value && index < this.otp.length - 1) {
      this.inputsRef.current[index + 1]?.focus();
    }
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !this.otp[index] && index > 0) {
      this.inputsRef.current[index - 1]?.focus();
    }
  };

 handleSubmit = async (
    mutateAsync: UseMutateAsyncFunction<
      unknown,
      unknown,
      OtpForm,
      unknown
    >,
    email: string,
    type:"login" | "register" | "forgotPassword",
    password?:string
  ) => {
      const finalOtp = this.otp.join("");
      if (this.otp.some((digit) => digit === "" || finalOtp.length < 6)) {
        toast.error("Please enter the complete 6-digit OTP.");
        return;
      }
      if(type==="forgotPassword" && !password){
        toast.error("Password is required.");
        return;
      }
      if(!email){
        toast.error("Email is required.");
        return;
      }
      console.log("OTP submitted:", finalOtp);
      try {
        const body = { email, otp: finalOtp, type,password };
        await mutateAsync(body);
      } catch (error) {
        if (isAxiosError(error)) {
          console.log(error);
          return;
        }
        toast.error(error as string);
      }
    };

    
}
