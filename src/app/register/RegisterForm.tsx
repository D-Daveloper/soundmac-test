"use client";
import React, { useState } from "react";
import Input from "../components/input/Input";
import Select from "@/components/Select";
import Link from "next/link";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { country_list } from "../utils/constants";
type FormField = {
  name: keyof RegisterFormType; // 👈 key must match form keys
  title: string;
  type?: string;
  placeholder: string;
  alt?: string;
  image?: string;
  required?: boolean;
};
const formvals: FormField[] = [
  {
    title: "first name",
    placeholder: "Enter your first name",
    alt: "a user icon for first name",
    image: "/user.svg",
    required: true,
    name: "first_name",
  },
  {
    title: "last name",
    placeholder: "Enter your Last name",
    alt: "a user icon for last name",
    image: "/user.svg",
    required: true,
    name: "last_name",
  },
  {
    title: "email",
    placeholder: "you@example.com",
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
  {
    title: "referral code",
    placeholder: "Enter your code",
    name: "referral",
  },
];

type RegisterFormType = {
  country: string;
  first_name: string;
  last_name: string;
  password: string;
  isChecked: boolean;
  email: string;
  referral: string;
};
const RegisterForm = () => {
  const router = useRouter();
  const api = UseAxios();
  const [loading,setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterFormType>({
    country: "",
    first_name: "",
    last_name: "",
    password: "",
    isChecked: false,
    email: "",
    referral: "",
  });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registerForm.isChecked) {
      toast.error("please check the box.");
      return;
    }else if(registerForm.password.length < 6){
      toast.error("Password must be at least 6 characters long.");
      return;
    }else if(registerForm.country === ""){
      toast.error("please select a country.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("auth/register", registerForm);
      // console.log(res);
      // console.log(res.data?.email);
      if (res.status === 200) {
        toast.success(res.data.msg);
        localStorage.setItem("soundmacPendingEmail", res.data.email);
        localStorage.setItem("soundmacRegistration", "true");
        router.push("/otp");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        return;
      }
      toast.error(error as string);
    }finally{
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;
    if (name === "isChecked") {
      setRegisterForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setRegisterForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  return (
    <>
      <form
        id="signup-form"
        onSubmit={submit}
        action=""
        className=" text-p leading-5 tracking-[0.5px] text-lg  w-full h-full lg:text-xl"
      >
        <div className="w-full flex flex-wrap justify-between gap-y-5 px-10">
          {formvals.map((item, index) => (
            <div key={index} className="flex flex-col w-[40%] max-sm:w-full">
              <Input
                value={
                  typeof registerForm[item.name] === "string"
                    ? (registerForm[item.name] as string)
                    : ""
                }
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
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <div className="flex">
              <p className="font-medium mb-2 text-sm">Country</p> <span className="text-red-500">*</span>
            </div>
            <div className="w-full">
              <Select
                selected={registerForm.country}
                setSelected={(t)=>setRegisterForm((prev)=>({...prev,country:t}))}
                placeholder="Select Country..."
                options={country_list}
                name="country"
              />
            </div>
          </div>
        </div>
        <div className="border-2 border-[#E1E1CF] my-5 w-full"></div>
      </form>
      <div className="flex justify-end flex-col gap-5 items-center pb-5 max-sm:text-xl">
        <div className="mt- flex gap-3">
          <input
            type="checkbox"
            className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
            name="isChecked"
            checked={registerForm.isChecked}
            onChange={handleChange}
          />
          <p className="leading-6 text-xs sm:text-base text-primary font-semibold flex gap-x-1">
            I agree to the 
          <span className="text-primary underline font-extrabold">
            <Link href={"https://sites.google.com/view/soundmac-legal/terms-condition"}>Terms of Service</Link>
          </span>
             and 
          <span className="text-primary underline font-extrabold">
            <Link href={"https://sites.google.com/view/soundmac-privacy-policy/home"}>Privacy Policy</Link>
          </span>
          </p>
        </div>
        <button
          form="signup-form"
          disabled={!registerForm.isChecked || loading}
          type="submit"
          className={
            "bg-disable py-3 px-8 font-bold rounded-lg text-white text-center max-w-fit hover:cursor-pointer max-sm:text-sm " +
            ((registerForm.isChecked && !loading) && " bg-primary hover:bg-primary/90")
          }
        >
          Sign Up
        </button>
        <p className="leading-6 text-[16px] text-p font-light">
          Already have an account?
          <span className="text-primary underline font-extrabold">
            <Link href={"/login"}>Sign In</Link>
          </span>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
