"use client";
import React, { useState } from "react";
import Input from "../components/input/Input";
import Link from "next/link";
import { toast } from "react-toastify";
import UseAxios from "@/util/customHooks/UseAxios";
import { AxiosError } from "axios";
import { useSearchParams, useRouter } from "next/navigation";
type FormField = {
  name: string; // 👈 key must match form keys
  title: string;
  type?: string;
  placeholder: string;
  alt?: string;
  image?: string;
  required?: boolean;
};
type LoginForm = {
  email: string;
  password: string;
  [key: string]: string;
};
const formvals: FormField[] = [
  {
    title: "email",
    placeholder: "Enter Email Address",
    alt: "an email icon",
    image: "/sms.svg",
    required: true,
    name: "email",
    type: "email",
  },
  {
    title: "password",
    placeholder: "Enter your Password",
    alt: "a lock icon for password",
    image: "/lock.svg",
    required: true,
    name: "password",
    type: "password",
  },
];

const LoginForm = () => {
  const api = UseAxios();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const safeRedirect = redirect?.startsWith("/")
    ? redirect
    : "/dashboard?tab=dashboard";
  const [loginForm, setLoginForm] = useState<LoginForm>({
    password: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginForm.email === "") {
      toast.error("please select a email.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("auth/login", loginForm);

      if (res.status === 200) {
        localStorage.setItem("soundmacPendingEmail", loginForm.email);
        localStorage.setItem("soundmacRedirectAfterOtp", safeRedirect);
        toast.success(res.data.msg);
        console.log(res.data);
        router.push("/otp");
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    console.log(name, value);
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <form
        id="signup-form"
        onSubmit={submit}
        action=""
        className=" text-p leading-5 tracking-[0.5px] text-lg w-full h-full sm:text-xl"
      >
        <div className="w-full flex flex-wrap justify-between gap-y-10 px-10">
          {formvals.map((item, index) => (
            <div
              key={item.name}
              className="flex flex-col w-[40%] max-sm:w-full"
            >
              <Input
                value={loginForm[item.name]}
                key={index}
                title={item.title}
                type={item.type}
                name={item.name}
                alt={item.alt}
                image={item.image}
                placeholder={item.placeholder}
                updateValue={handleChange}
                required={item.required}
              />
            </div>
          ))}
        </div>
        <p className="leading-6 text-[16px] text-p font-light text-center my-10">
          Forgot password?
          <span className="text-primary underline font-extrabold">
            <Link href={"/forgot-password"}>Forgot Password</Link>
          </span>
        </p>
        <div className="border-2 border-[#E1E1CF] my-10 w-full"></div>
      </form>
      <div className="flex justify-end flex-col gap-10 items-center pb-9 max-sm:text-2xl">
        <button
          disabled={!loginForm.password || !loginForm.email || loading}
          form="signup-form"
          type="submit"
          className={
            "bg-disable px-8 py-3 font-bold rounded-lg text-white text-center max-w-fit hover:cursor-pointer max-sm:text-sm " +
            ((loginForm.password && !loading) && " bg-primary hover:bg-primary/90")
          }
        >
          Sign In
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

export default LoginForm;
