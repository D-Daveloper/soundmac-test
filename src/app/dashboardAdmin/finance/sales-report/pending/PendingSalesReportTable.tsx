import React from "react";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { ISalesReport } from "@/util/models/salesReportModel";
import { handleCopy } from "@/util/middleware/functions";

const PendingSalesReportTable = ({
  salesReport,
  isfetching,
}: {
  salesReport: ISalesReport[];
  isfetching: boolean;
}) => {
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
                  <th className="p-4 min-w-[180px]">Track Title</th>
                  <th className="p-4 min-w-[160px]">Label</th>
                  <th className="p-4 min-w-[150px]">Artist</th>
                  <th className="p-4 min-w-[120px]">Product Type</th>
                  <th className="p-4 min-w-[140px]">UPC</th>
                  <th className="p-4 min-w-[130px]">ISRC</th>
                  <th className="p-4 min-w-[120px] text-right">Revenue</th>
                  <th className="p-4 min-w-[130px] text-right">Batch ID</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                {salesReport.map((report) => (
                  <tr
                    key={report._id.toString()}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Track Title */}
                    <td
                      onClick={() => handleCopy(report.trackTitle)}
                      title="Click to copy Track Title"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all font-semibold text-gray-900 truncate max-w-[180px]"
                    >
                      {report.trackTitle}
                    </td>

                    {/* Label */}
                    <td
                      onClick={() => handleCopy(report.label)}
                      title="Click to copy Label"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all truncate max-w-[160px]"
                    >
                      {report.label}
                    </td>

                    {/* Artist */}
                    <td
                      onClick={() => handleCopy(report.trackArtistsRaw)}
                      title="Click to copy Artist Name"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all truncate max-w-[150px]"
                    >
                      {report.trackArtistsRaw || 'N/A'}
                    </td>

                    {/* Product Type */}
                    <td
                      onClick={() => handleCopy(report.productType)}
                      title="Click to copy Product Type"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all text-xs"
                    >
                      <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded font-medium">
                        {report.productType}
                      </span>
                    </td>

                    {/* UPC */}
                    <td
                      onClick={() => handleCopy(report.upc.toString())}
                      title="Click to copy UPC"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all font-mono text-xs text-gray-500"
                    >
                      {report.upc.toString() || "N/A"}
                    </td>

                    {/* ISRC */}
                    <td
                      onClick={() => handleCopy(report.isrc)}
                      title="Click to copy ISRC"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all font-mono text-xs text-gray-500"
                    >
                      {report.isrc}
                    </td>

                    {/* Revenue (Right aligned & Formatted Currency) */}
                    <td
                      onClick={() => handleCopy(String(report.netAmountUsd))}
                      title="Click to copy Revenue Amount"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all text-right font-mono font-semibold text-gray-900"
                    >
                      ${Number(report.netAmountUsd).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4, // Handles precision revenue fractions nicely
                      })}
                    </td>

                    {/* Batch ID */}
                    <td
                      onClick={() => handleCopy(report.reportBatch.toString())}
                      title="Click to copy Batch ID"
                      className="p-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 hover:text-primary-600 transition-all text-right font-mono text-xs text-gray-400"
                    >
                      #{report.reportBatch.toString()}
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

export default PendingSalesReportTable;