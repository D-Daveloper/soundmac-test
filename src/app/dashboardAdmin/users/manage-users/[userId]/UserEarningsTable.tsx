import React from "react";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { AdminUserDetailsResponse } from "@/app/type";
import { formatAmount } from "@/util/middleware/functions";

const UserEarningsTable = ({
  earningsInfo,
  isfetching,
}: {
  earningsInfo: AdminUserDetailsResponse["earningsArray"];
  isfetching: boolean;
}) => {

  return (
    <div className="w-full bg-gray-50 p-6 pb-0">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isfetching ? (
          <InlineLoadingScreen />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto min-w-[700px]">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr className="bg-primary-50 border-b border-gray-200 font-extrabold text-primary-500 text-center text-xs capitalize tracking-wider">
                    <th className="min-w-50 p-2 h-10 sticky top-0 z-5">
                       Release Title
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      upc
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      label
                    </th>
                    <th className="w-30 max-w-30 p-2 h-10 sticky top-0 z-5">
                     territory
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Dsp
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Net amount
                    </th>
                    {/* <th className="w-30 max-w-30 p-2 h-10 sticky top-0 z-5">
                      Status
                    </th> */}
                  </tr>
                </thead>
              </table>
            </div>
            {/* table body */}
            <div className="overflow-auto max-h-[500px] h-[500px] min-w-[700px] w-full">
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-100 text-text-body text-md font-medium leading-5 tracking-tight">
                  {earningsInfo.map((item) => (
                    <tr
                    tabIndex={1}
                      key={item._id.toString()}
                      className="hover:bg-gray-200 transition-colors cursor-pointer text-center"
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
                      <td className="min-w-50 pl-2 py-4 whitespace-nowrap overflow-hidden">
                       {item.trackTitle}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap font-bold overflow-hidden">
                        {item?.upc}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {item?.label}
                      </td>
                      <td className="w-30 max-w-30 pl-2 py-4 whitespace-nowrap">
                        {item?.territory}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {item?.dsp}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {formatAmount(item?.netAmountUsd.$numberDecimal)}
                      </td>
                      {/* <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {new Date(item.createdAt).toDateString()}
                      </td>
                      <td className="w-30 max-w-30 pl-2 py-4 whitespace-nowrap">
                        {getStatusBadge(item.userStatus)}
                      </td> */}
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

export default UserEarningsTable;
