"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { Box, Mail, Phone } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import FAQAccordion from "./Faq";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";

const Page = () => {
  const api = UseAxios();
  const dashboardContext = useContext(DashboardContext);
  const [helpForm, setHelpForm] = useState({
    category: "",
    description: "",
    screenshot: null as File | null,
  });

  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setisSubmitting] = useState(false);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Help & Support");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, files } = e.target;
    if (name === "screenshot") {
      const file = files && files.length ? files[0] : null;
      setHelpForm((prev) => ({ ...prev, screenshot: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setHelpForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitSupportRequest = async () => {
    try {
      if (!helpForm.category || !helpForm.description) {
        toast.warn("Please fill in all required fields.");
        return;
      }
      setisSubmitting(true);
      const formData = new FormData();
      Object.entries(helpForm).forEach(([key, value]) => {
        if (value != null) {
          formData.append(key, value);
        }
      });
      const res = await api.post("users/support-requests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data);
      toast.success(res.data.msg);
      setHelpForm({
        category: "",
        description: "",
        screenshot: null as File | null,
      });
      setImage(null);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong!");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <div className=" py-10 px-5 bg-main-white min-h-screen w-full ">
      {isSubmitting ? (
        <InlineLoadingScreen />
      ) : (
        <div className="flex justify-between lg:pl-[260px] max-md:flex-col-reverse">
          <div className="">
            <div className="flex flex-col gap-5 w-[70%] max-sm:w-full sm:text-sm text-lg">
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
                  selected={helpForm.category}
                  setSelected={(t) =>
                    setHelpForm((prev) => ({ ...prev, category: t }))
                  }
                  placeholder="Select"
                  options={country_list}
                  name="category"
                />
              </div>

              <div>
                <div className="flex gap-1 sm:text-sm text-lg">
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
              {/* cover art */}
              <div>
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Screenshot
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 ">
                  Please upload a screenshot of the issue you are facing. This
                  will help us understand the problem better and provide you
                  with a quicker resolution.
                </p>
                <div className="flex items-center justify-center w-60">
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                    <div className="flex flex-col max-sm:w-full gap-2">
                      <div className="flex items-center justify-center w-60">
                        <label
                          htmlFor="screenshot"
                          className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                        >
                          <div
                            className={
                              "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                              (!helpForm.screenshot && " bg-neutral-50 ")
                            }
                          >
                            <Image
                              src={image ? image : "/document-upload.svg"}
                              width={60}
                              height={60}
                              alt="music note icon"
                              className={
                                helpForm.screenshot
                                  ? " w-full object-cover min-w-15 h-15"
                                  : undefined
                              }
                            />
                          </div>
                          <div className="w-[50%]">
                            {!helpForm.screenshot ? (
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-bold text-text-body">
                                  Supported Files:
                                </span>{" "}
                                JPG, PNG
                                <br />
                                3000 x 3000px minimum
                              </p>
                            ) : (
                              <p className="font-bold text-[16px] text-[#494949] truncate">
                                <span className="font-semibold">
                                  {helpForm.screenshot?.name}
                                </span>
                              </p>
                            )}
                          </div>
                          <input
                            id="screenshot"
                            name="screenshot"
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handleChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <button
                  disabled={!helpForm.category || !helpForm.description}
                  onClick={() => {
                    handleSubmitSupportRequest();
                  }}
                  className={
                    "sm:w-[150px] justify-center mt-15 font-bold text-xl rounded-lg px-3 py-2.5 hover:bg-primary-500/80 flex gap-2 text-white disabled:bg-disable bg-primary-500 "
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
          <FAQAccordion />
        </div>
      )}
    </div>
  );
};

export default Page;
