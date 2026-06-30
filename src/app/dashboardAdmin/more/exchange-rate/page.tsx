"use client";
import Input from "@/app/components/input/Input";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import useAxios from "@/util/customHooks/UseAxios";
import { numRegex } from "@/util/middleware/functions";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const queryClient = useQueryClient();
  const api = useAxios();
  const [form, setform] = useState({
    exchange_rate: "",
  });
  const [isloading, setIsloading] = useState(false);

  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Exchange Rate");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setform((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit() {
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
            updateValue={handleChange}
            required={true}
          />
          <button
            className="w-fit mt-5 font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 flex text-white! bg-primary-500 disabled:bg-gray-300 "
            onClick={() => handleSubmit()}
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
    </div>
  );
};

export default Page;
