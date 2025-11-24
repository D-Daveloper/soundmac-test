"use client";
import React, { useState } from "react";
import Input from "../components/input/Input";
import Link from "next/link";
import { toast } from "react-toastify";
import UseAxios from "@/util/customHooks/UseAxios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const ForgotPasswordForm = () => {
  const api = UseAxios();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email === "") {
      toast.error("please enter email.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("auth/forgot-password", { email });

      if (res.status === 200) {
        localStorage.setItem("soundmacForgotEmail", email);
        toast.success(res.data.msg);
        router.push("/verify-otp");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        return;
      }
      toast.error(error as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        id="forgotpassword-form"
        onSubmit={submit}
        action=""
        className=" text-p leading-5 tracking-[0.5px] text-lg w-full h-full sm:text-xl"
      >
        <div className="w-full flex flex-wrap justify-between gap-y-10 px-10">
          <div className="flex flex-col w-[80%] max-sm:w-full">
            <Input
              value={email}
              title={"Enter Email"}
              type={"text"}
              name={"email"}
              alt={"an email icon"}
              image={"/sms.svg"}
              placeholder={"you@example.com"}
              updateValue={(e) => setEmail(e.target.value)}
              required={true}
            />
          </div>
        </div>
        <div className="border-2 border-[#E1E1CF] my-10 w-full"></div>
      </form>
      <div className="flex justify-end flex-col gap-10 items-center pb-9 max-sm:text-2xl">
        <button
          disabled={!email || loading}
          form="forgotpassword-form"
          type="submit"
          className={
            "bg-disable px-8 py-3 font-bold rounded-lg text-white text-center max-w-fit hover:cursor-pointer max-sm:text-sm " +
            (!loading && " bg-primary hover:bg-primary/90")
          }
        >
          Proceed
        </button>
        <p className="leading-6 text-[16px] text-p font-light">
          Don&apos;t have an account?
          <span className="text-primary underline font-extrabold">
            <Link href={"/register"}>Sign Up</Link>
          </span>
        </p>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
