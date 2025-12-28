import PromotionCard from "@/app/components/promotionCard/PromotionCard";
import { promotionTestData } from "@/app/constant";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const MyPromotion = ({
  setExplorePage,
}: {
  setExplorePage: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  return (
    // <div>
    <>
      <div className="w-full h-full grid grid-cols-2 gap-5 max-mobile:grid-cols-1 max-w-[2000px] mx-auto mb-20">
        {promotionTestData.map((promotionContent,index)=>(
          <PromotionCard
            key={index}
            category={promotionContent.category}
            songtitle={promotionContent.songTitle}
            packageType={promotionContent.packageType}
            startDate={promotionContent.startDate}
            endDate={promotionContent.endDate}
            type={promotionContent.type}
            isActive={promotionContent.isActive}
          />
        ))}
      </div>
      {/* <div className="w-full h-full flex flex-col items-center justify-center gap-5">
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
         You haven&apos;t started any promotions. Your active and past campaigns will appear here once you run one.
        </p>
        <button
          onClick={() => {
              setExplorePage(true);
          }}
          className={
            "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
          }
        >
          Go to Promotions
        </button>
      </div> */}
    </>
    // </div>
  );
};

export default MyPromotion;
