"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import PromotionCard from "@/app/components/promotionCard/PromotionCard";
import { promotionTestData } from "@/app/constant";
import UseAxios from "@/util/customHooks/UseAxios";
import { useGetPromotionData } from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

const MyPromotion = () => {
  const router = useRouter();
  const api = UseAxios();
  const [page, setPage] = useState(1);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const { data, isLoading } = useGetPromotionData({ page });

  const handleSubmit = async (id:string) => {
    try {
      console.log("Attempting to submit promotion with ID:", id);
      setIsSubmittingForm(true);
      if (!id) {
        toast.warn("Promotion ID is required.");
        return;
      }
      let res;
      res = await api.put("promotions", { promotionId: id }, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(res?.data?.msg);
      window.location.href = res.data.url;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <>
      {isLoading || isSubmittingForm? (
        <InlineLoadingScreen />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="w-full h-full grid grid-cols-2 gap-5 max-mobile:grid-cols-1 max-w-[2000px] mx-auto mb-20">
            {data.data.map((promotionContent, index) => (
              <PromotionCard
                key={index}
                category={promotionContent.category}
                songtitle={promotionContent.releaseTitle}
                packageType={promotionContent.packageName}
                startDate={new Date(promotionContent.startDate).toDateString()}
                endDate={new Date(promotionContent.endDate).toDateString()}
                isActive={promotionContent.isActive}
                handleSubmit ={() => handleSubmit(promotionContent._id as string)}
              />
            ))}
          </div>
          <div>
            <Pagination
              currentPage={page}
              totalPages={data ? data.totalPages : 0}
              onChange={(page) => setPage(page)}
            />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-5">
          <div>
            <Image
              priority={true}
              src={"/no_promotion_image.png"}
              alt="an image depicting no promotion found for the user"
              width={200}
              height={200}
            />
          </div>
          <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-icon-color">
            No Active Promotions
          </h1>
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] text-center">
            You haven&apos;t started any promotions. Your active and past
            campaigns will appear here once you run one.
          </p>
          <button
            onClick={() => {
              router.push("/dashboard/promotion?page=explore");
            }}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
            }
          >
            Go to Promotions
          </button>
        </div>
      )}
    </>
  );
};

export default MyPromotion;
