import React from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { useRouter } from "next/navigation";
import { withdrawals } from "@/app/type";

const AllWithdrawalReqeuestTable = ({
  Withdrawals,
  isfetching,
}: {
  Withdrawals: withdrawals[];
  isfetching: boolean;
}) => {
  const router = useRouter();

  const getStatusBadge = (status: withdrawals["withdrawalStatus"]) => {
    const styles = {
      active: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      rejected: "bg-red-100 text-red-700 border-red-200", // Standardized to red
    };

    const icons = {
      active: "/tick-circle.svg",
      pending: "/info-circle.svg",
      approved: "/tick-circle.svg",
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

  return (
    <div className="w-full bg-gray-50 p-1">
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
                  <th className="p-4 min-w-[220px]">Request ID</th>
                  <th className="p-4 min-w-[250px]">User Email</th>
                  <th className="p-4 min-w-[150px] text-right">Amount Requested</th>
                  <th className="p-4 min-w-[180px]">Date Requested</th>
                  <th className="p-4 min-w-[130px]">Status</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                {Withdrawals.map((withdrawal) => (
                  <tr
                    onClick={() =>
                      router.push(
                        "/dashboardAdmin/finance/withdrawal-requests/" +
                          withdrawal._id
                      )
                    }
                    key={withdrawal._id.toString()}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {/* Request ID */}
                    <td className="p-4 whitespace-nowrap font-mono text-gray-900 select-all max-w-[220px] truncate">
                      {withdrawal._id}
                    </td>

                    {/* User Email */}
                    <td className="p-4 whitespace-nowrap text-gray-900 font-semibold max-w-[250px] truncate">
                      {withdrawal.user?.email || "N/A"}
                    </td>

                    {/* Amount Requested - Right-aligned as is standard for financial values */}
                    <td className="p-4 whitespace-nowrap text-right text-gray-900 font-semibold font-mono">
                      ${Number(withdrawal.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Date Requested */}
                    <td className="p-4 whitespace-nowrap text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.withdrawalStatus)}
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

export default AllWithdrawalReqeuestTable;