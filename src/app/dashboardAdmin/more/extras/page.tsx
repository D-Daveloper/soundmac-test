"use client";
import Input from "@/app/components/input/Input";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import useAxios from "@/util/customHooks/UseAxios";
import { handleCopy, numRegex } from "@/util/middleware/functions";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { X } from "lucide-react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const queryClient = useQueryClient();
  const api = useAxios();
  const [form, setform] = useState({
    exchange_rate: "",
  });
  const [apiKeyForm, setapiKeyForm] = useState({
    email: "",
    name: "",
    isNew: false,
  });
  const [copyApiKey, setcopyApiKey] = useState<string | null>(null);
  const [isloading, setIsloading] = useState(false);

  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Extras");
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "form" | "apiKeyForm",
  ) => {
    const { value, name, type, checked } = e.target;
    if (formType === "form") {
      setform((prev) => ({ ...prev, [name]: value }));
    } else {
      setapiKeyForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  async function handleUpdateExchangeRate() {
    try {
      if (
        !form.exchange_rate ||
        !numRegex.test(form.exchange_rate) ||
        parseInt(form.exchange_rate, 10) <= 0
      ) {
        return toast.warn("Please enter a number greater than zero.");
      }
      setIsloading(true);
      const res = await api.post("admin/more/exchange-rate", form);
      await queryClient.invalidateQueries({
        queryKey: ["adminWithdrawalDetails"],
      });
      toast.success(res.data?.msg || "Successful");
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error(error as string);
    } finally {
      setIsloading(false);
    }
  }

  async function handleUpdateOrAddApiKey() {
    try {
      if (!apiKeyForm.email) {
        return toast.warn("Please enter valid email.");
      } else if (!apiKeyForm.name.trim()) {
        return toast.warn("Name field cannot be empty.");
      }

      setIsloading(true);
      const res = await api.post("admin/more/api-key", apiKeyForm);

      toast.success(res.data?.msg || "Successful");
      setcopyApiKey(res.data?.key || null);
      setapiKeyForm({
        email: "",
        name: "",
        isNew: false,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error(error as string);
    } finally {
      setIsloading(false);
    }
  }

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col gap-10 lg:pl-[260px] px-5 overflow-hidden">
      <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 px-1">
        <div className="flex flex-col w-[40%] max-sm:w-full">
          <Input
            value={form.exchange_rate}
            title={"Exchange Rate"}
            type={"number"}
            name={"exchange_rate"}
            placeholder={"Enter new rate"}
            updateValue={(e) => handleChange(e, "form")}
            required={true}
          />
          <button
            className="w-fit mt-5 font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 flex text-white! bg-primary-500 disabled:bg-gray-300 "
            onClick={() => handleUpdateExchangeRate()}
            disabled={isloading}
          >
            <div
              className={
                "flex justify-center items-center mr-2 " +
                (!isloading && " hidden")
              }
            >
              <div className="w-3 h-3 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            Save
          </button>
        </div>
      </div>
      <div>
        <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 px-1">
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <Input
              value={apiKeyForm.email}
              title={"Email"}
              type={"email"}
              name={"email"}
              placeholder={"Enter email"}
              updateValue={(e) => handleChange(e, "apiKeyForm")}
              required={true}
            />
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <Input
              value={apiKeyForm.name}
              title={"Name"}
              type={"text"}
              name={"name"}
              placeholder={"Enter company name"}
              updateValue={(e) => handleChange(e, "apiKeyForm")}
              required={true}
            />
          </div>
          <div className="flex w-fit gap-2 items-center">
            <input
              type="checkbox"
              className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
              name="isNew"
              checked={apiKeyForm.isNew}
              onChange={(e) => handleChange(e, "apiKeyForm")}
            />
            <p className="leading-6 text-sm font-medium">
              Are you creating a new key for this user? (This will invalidate
              all existing keys for this user)
            </p>
          </div>
        </div>
        <div className="w-full flex flex-wrap gap-5 px-1">
          <button
            className="w-fit mt-5 font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 flex text-white! bg-primary-500 disabled:bg-gray-300 "
            onClick={() => handleUpdateOrAddApiKey()}
            disabled={isloading}
          >
            <div
              className={
                "flex justify-center items-center mr-2 " +
                (!isloading && " hidden")
              }
            >
              <div className="w-3 h-3 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            Save
          </button>
          <Link
            href={"/dashboardAdmin/more/extras/manage-api-key"}
            className="w-fit mt-5 font-bold text-sm rounded-lg px-4 py-2.5 flex text-primary-500! bg-transparent border-2 border-primary-500"
          >
            Manage Keys
          </Link>
        </div>
      </div>

      {/* send notification Modal */}
      {copyApiKey && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
            {/* Reject Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Notify User
              </h3>
              <button
                onClick={() => {
                  setcopyApiKey(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reject Modal Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Click to copy the key and send it to the user. You will not be
                able to view this key again.
              </p>
              <button onClick={() => handleCopy(copyApiKey)}>
                {copyApiKey}
              </button>

              {/* Reject Modal Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setcopyApiKey(null);
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
