import React, { useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { IPromotion } from "@/util/models/promotionModel";
import { useRouter } from "next/navigation";

const PromotionTable = ({
  promotions,
  isfetching,
}: {
  promotions: IPromotion[];
  isfetching: boolean;
}) => {
  const router = useRouter();

  const getStatusBadge = (status: IPromotion["promotionStatus"]) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-[#2D68C4] text-white border-[#2D68C4]",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      rejected: "bg-red-100 text-red-700 border-red-200", // Standardized to red
    };

    const icons = {
      approved: "/tick-circle.svg",
      pending: "/info-circle.svg",
      completed: "/info-circle.svg",
      draft: "/info-circle.svg",
      rejected: "/info-circle.svg",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status]}`}
      >
        <Image
          priority={false}
          src={icons[status]}
          alt="status icon"
          width={10}
          height={10}
        />
        {status}
      </span>
    );
  };

  const [selectedRelease, setselectedRelease] = useState<IPromotion | null>(null);

  return (
    <div className="w-full bg-gray-50 p-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {isfetching ? (
          <InlineLoadingScreen />
        ) : (
          /* Unified Scrollable Container */
          <div className="overflow-auto max-h-[550px] w-full">
            <table className="w-full border-collapse text-left text-sm">
              {/* Sticky Header */}
              <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-200 shadow-[0_1px_0_0_rgba(229,231,235,1)]">
                <tr className="bg-primary-50 font-bold text-primary-500 text-xs capitalize tracking-wider">
                  <th className="p-4 min-w-[180px]">Promotion Type</th>
                  <th className="p-4 min-w-[200px]">Promotion Name</th>
                  <th className="p-4 min-w-[120px] text-right">Cost</th>
                  <th className="p-4 min-w-[160px]">Date Requested</th>
                  <th className="p-4 min-w-[130px]">Status</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                {promotions.map((promotion) => (
                  <tr
                    onClick={() =>
                      router.push(
                        `/dashboardAdmin/more/promotions/${promotion._id}`
                      )
                    }
                    key={promotion._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {/* Promotion Type */}
                    <td className="p-4 whitespace-nowrap text-gray-900 font-semibold truncate max-w-[180px]">
                      {promotion.category}
                    </td>

                    {/* Promotion Name (Release Title) */}
                    <td className="p-4 whitespace-nowrap text-gray-900 truncate max-w-[200px]">
                      {promotion.releaseTitle}
                    </td>

                    {/* Cost - Right Aligned & Formatted */}
                    <td className="p-4 whitespace-nowrap text-right text-gray-900 font-mono">
                      ${Number(promotion.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Date Requested */}
                    <td className="p-4 whitespace-nowrap text-gray-500">
                      {new Date(promotion.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(promotion.promotionStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionTable;