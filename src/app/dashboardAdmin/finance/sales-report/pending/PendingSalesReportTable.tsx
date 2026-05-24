import React, { useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { IPromotion } from "@/util/models/promotionModel";
import { useRouter } from "next/navigation";
import { ISalesReport } from "@/util/models/salesReportModel";
import { handleCopy } from "@/util/middleware/functions";

const PendingSalesReportTable = ({
  salesReport,
  isfetching,
}: {
  salesReport: ISalesReport[];
  isfetching: boolean;
}) => {
  const router = useRouter();

  const [selectedRelease, setselectedRelease] = useState<IPromotion | null>(
    null,
  );
  console.log(selectedRelease);

  return (
    <div className="w-full bg-gray-50 p-6 pb-0">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isfetching ? (
          <InlineLoadingScreen />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto min-w-[700px] w-full">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr className="bg-primary-50 border-b border-gray-200 font-extrabold text-primary-500 text-center! text-xs capitalize tracking-wider">
                    <th className="w-[15%] min-w-[15%] max-w-[15%] h-10 sticky top-0 z-5">
                      track title
                    </th>
                    <th className="w-[15%] min-w-[15%] max-w-[15%] h-10 sticky top-0 z-5">
                      label
                    </th>
                    <th className="w-[10%] min-w-[10%] max-w-[10%] h-10 sticky top-0 z-5">
                      artist
                    </th>
                    <th className="w-[10%] min-w-[10%] max-w-[10%] h-10 sticky top-0 z-5">
                      product type
                    </th>
                    <th className="w-[10%] min-w-[10%] max-w-[10%] h-10 sticky top-0 z-5">
                      upc
                    </th>
                    <th className="w-[10%] min-w-[10%] max-w-[10%] h-10 sticky top-0 z-5">
                      isrc
                    </th>
                    <th className="w-[15%] min-w-[15%] max-w-[15%] h-10 sticky top-0 z-5">
                      revenue
                    </th>
                    <th className="w-[15%] min-w-[15%] max-w-[15%] h-10 sticky top-0 z-5">
                      batch id
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* table body */}
            <div className="overflow-auto max-h-[500px] h-[500px] min-w-[700px] w-full">
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-100 text-text-body text-md font-medium leading-5 tracking-tight text-center">
                  {salesReport.map((report) => (
                    <tr
                      // onClick={() => router.push(`/dashboardAdmin/more/reports/${report._id}`)}
                      // tabIndex={1}
                      key={report._id.toString()}
                      className=" transition-colors"
                    >
                      <td onClick={() => handleCopy(report.trackTitle)} className="w-[15%] min-w-[15%] max-w-[15%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.trackTitle}
                      </td>
                      <td onClick={() => handleCopy(report.label)} className="w-[15%] min-w-[15%] max-w-[15%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.label}
                      </td>
                      <td onClick={() => handleCopy(report.trackArtistsRaw)} className="w-[10%] min-w-[10%] max-w-[10%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.trackArtistsRaw}
                      </td>
                      <td onClick={() => handleCopy(report.productType)} className="w-[10%] min-w-[10%] max-w-[10%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.productType}
                      </td>
                      <td onClick={() => handleCopy(report.upc.toString())} className="w-[10%] min-w-[10%] max-w-[10%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.upc.toString()}
                      </td>
                      <td onClick={() => handleCopy(report.isrc)} className="w-[10%] min-w-[10%] max-w-[10%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.isrc}
                      </td>
                      <td onClick={() => handleCopy(String(report.netAmountUsd))} className="w-[15%] min-w-[15%] max-w-[15%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {String(report.netAmountUsd)}
                      </td>
                      <td onClick={() => handleCopy(report.reportBatch.toString())} className="w-[15%] min-w-[15%] max-w-[15%] py-4 whitespace-nowrap cursor-pointer hover:bg-gray-200 truncate">
                        {report.reportBatch.toString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingSalesReportTable;
