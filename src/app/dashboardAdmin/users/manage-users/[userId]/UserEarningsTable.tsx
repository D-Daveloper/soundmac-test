import React from "react";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { AdminUserDetailsResponse } from "@/app/type";
import { formatAmount, handleCopy } from "@/util/middleware/functions";

const UserEarningsTable = ({
  earningsInfo,
  isfetching,
}: {
  earningsInfo: AdminUserDetailsResponse["earningsArray"];
  isfetching: boolean;
}) => {
  return (
    <div className="w-full bg-gray-50 sm:p-2 pb-0">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {isfetching ? (
          <div className="p-8">
            <InlineLoadingScreen />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] w-full">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="bg-primary-50 sticky top-0 z-10 border-b border-gray-200">
                <tr className="font-extrabold text-primary-500 text-center text-xs uppercase tracking-wider">
                  <th scope="col" className="px-4 py-3 min-w-[200px] text-left">
                    Release Title
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    UPC
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    Label
                  </th>
                  <th scope="col" className="px-4 py-3 w-[120px]">
                    Territory
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    DSP
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    Net Amount
                  </th>
                  {/* <th className="w-30 max-w-30 p-2 h-10 sticky top-0 z-5">
                      Status
                    </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-text-body text-sm font-medium">
                {earningsInfo && earningsInfo.length > 0 ? (
                  earningsInfo.map((item, idx) => (
                    <tr
                      tabIndex={0}
                      key={item._id?.toString() || idx}
                      className="hover:bg-gray-50 transition-colors cursor-pointer text-center focus:outline-none focus:bg-gray-100"
                    >
                      {/* <td className="min-w-50 pl-2 py-4 whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "relative max-w-[40px] max-h-[40px] min-w-[40px] h-[40px] rounded-2xl border border-neutral-100"
                            }
                          >
                            <Image
                              src={item.profilePic ||"/signinimage.png"}
                              fill
                              alt="music note icon"
                              className={" object-cover rounded-md "}
                            />
                          </div>
                          <span className="">{item.firstName}</span><span className="">{item.lastName}</span>
                        </div>
                      </td> */}

                      {/* Release Title */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-left font-semibold text-gray-900 truncate max-w-[200px]">
                        {item.trackTitle || "N/A"}
                      </td>

                      {/* UPC */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-gray-700"
                      onClick={() => handleCopy(String(item?.upc))}
                      title="copy upc number"
                      >
                        {item?.upc || "N/A"}
                      </td>

                      {/* Label */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                        {item?.label || "N/A"}
                      </td>

                      {/* Territory */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                        {item?.territory || "N/A"}
                      </td>

                      {/* DSP */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                        {item?.dsp || "N/A"}
                      </td>

                      {/* Net Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-gray-900">
                        {item?.netAmountUsd?.$numberDecimal
                          ? formatAmount(item.netAmountUsd.$numberDecimal)
                          : "$0.00"}
                      </td>

                      {/* <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {new Date(item.createdAt).toDateString()}
                      </td>
                      <td className="w-30 max-w-30 pl-2 py-4 whitespace-nowrap">
                        {getStatusBadge(item.userStatus)}
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No earnings records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEarningsTable;