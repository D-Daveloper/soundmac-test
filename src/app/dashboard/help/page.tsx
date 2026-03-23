"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { Box, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import FAQAccordion from "./Faq";

const page = () => {
  const dashboardContext = useContext(DashboardContext);
  const [helpForm, setHelpForm] = useState({
    title: "",
    description: "",
  });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Help & Support");
  }, []);
  return (
    <div className=" py-10 px-5 bg-main-white min-h-screen w-full flex justify-between lg:pl-[260px] max-md:flex-col-reverse">
      <div className="">
        <div className="flex flex-col w-[70%] max-sm:w-full sm:text-sm text-lg">
          <p className="font-medium flex">
            What do you need help with?
            <Image
              priority={false}
              loading="lazy"
              src="/required.svg"
              alt="a star marking this field as required"
              width={0}
              height={0}
              className="w-2 -mt-5"
            />
          </p>

          <div className="w-full">
            <Select
              selected={helpForm.title}
              setSelected={(t) =>
                setHelpForm((prev) => ({ ...prev, country: t }))
              }
              placeholder="Select"
              options={country_list}
              name="country"
            />
          </div>

          <div>
            <div className="flex gap-1 sm:text-sm text-lg mt-10">
              <p className="font-medium relative">
                <Image
                  priority={false}
                  loading="lazy"
                  src="/required.svg"
                  alt="a star marking this field as required"
                  width={0}
                  height={0}
                  className="w-2 left-[100%] absolute"
                />
                Describe your issue{" "}
              </p>
            </div>

            <textarea
              value={helpForm.description}
              onChange={(e) =>
                setHelpForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full min-h-80 border-2 rounded-2xl p-4 mt-1"
              placeholder="Share the details of your complaint so we can assist you quickly."
            ></textarea>
          </div>
          <div className="w-full">

          <button
            onClick={() => {
              // handleSubmit(songForm, "upload");
            }}
            className={
              "sm:w-[180px] mt-15 font-bold text-xl rounded-lg px-4 py-2.5 hover:bg-primary/20 flex gap-2 text-white bg-disable"
            }
          >
            Submit
            <Box width={24} height={24} />
          </button>
          </div>
        </div>
        <div className="bg-warning-50 rounded-2xl mt-10 p-4 gap-5 flex flex-col">
          <p className="text-caption-one text-xl text-primary-500 flex font-bold gap-2">
            <Mail strokeWidth={2} /> support@soundmac.com
          </p>
          <p className="text-caption-one text-xl text-primary-500 flex font-bold gap-2">
            <Phone strokeWidth={2} /> +234 901 234 5678
          </p>
          <p className="text-disable text-xl flex font-bold gap-2">
            Working Hours: Monday to Friday, 9:00 AM to 6:00 PM (WAT)
          </p>
        </div>
      </div>
      <FAQAccordion/>
    </div>
  );
};

export default page;
