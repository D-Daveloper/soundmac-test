"use client";
import React, { useState } from "react";
import Input from "../components/input/Input";
import Select from "@/components/Select";
import Link from "next/link";
import UseAxios from "@/util/axios/UseAxios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
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
  {
    title: "referral code",
    placeholder: "Enter your code",
    name: "referral",
  },
];
const country_list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

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
  const [registerForm, setRegisterForm] = useState<RegisterFormType>({
    country: "",
    first_name: "",
    last_name: "",
    password: "",
    isChecked: false,
    email: "",
    referral: "",
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
      const res = await api.post("auth/register", registerForm);
      console.log(res);
      console.log(res.data?.email);
      if (res.status === 200) {
        toast.success(res.data.msg);
        localStorage.setItem("soundmacPendingEmail", res.data.email);
        router.push("/otp");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        return;
      }
      toast.error(error as string);
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
        <div className="w-full flex flex-wrap justify-between gap-y-10 px-10">
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
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
            </div>
          ))}
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <p className="font-medium mb-2">Country</p>
            <div className="w-full">
              <Select
                selected={registerForm}
                setSelected={setRegisterForm}
                placeholder="Select Country..."
                options={country_list}
              />
            </div>
          </div>
        </div>
        <div className="border-2 border-[#E1E1CF] my-10 w-full"></div>
      </form>
      <div className="flex justify-end flex-col gap-5 items-center pb-9 max-sm:text-xl">
        <div className="mt-10 flex gap-3">
          <input
            type="checkbox"
            className="p-5 max-sm:p-3 rounded-lg"
            name="isChecked"
            checked={registerForm.isChecked}
            onChange={handleChange}
          />
          <p className="leading-6 text-sm sm:text-lg">
            I agree to the Terms of Service and Privacy Policy
          </p>
        </div>
        <button
          form="signup-form"
          disabled={!registerForm.isChecked}
          type="submit"
          className={
            "bg-disable lg:py-5 lg:px-10 max-lg:p-3 max-lg:px-5 rounded-2xl text-white text-center max-w-fit hover:cursor-pointer " +
            (registerForm.isChecked && "bg-primary hover:bg-primary/90")
          }
        >
          Sign Up
        </button>
        <p className="leading-6 text-xl">
          Already have an account?
          <span className="text-primary underline">
            <Link href={"/login"}>Sign In</Link>
          </span>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
