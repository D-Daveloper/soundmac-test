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
  const getStatusBadge = (status: withdrawals["withdrawalStatus"]) => {
    const styles = {
      active: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      rejected: "bg-error-500 text-white border-gray-200",
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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        <Image
          priority={false}
          src={icons[status]}
          alt="search icon"
          width={10}
          height={10}
          className="text-white!"
        />
        {status}
      </span>
    );
  };

const router = useRouter()
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
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                       Request ID
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      user
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Amount Requested
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Date Requested
                    </th>
                    <th className="w-30 max-w-30 p-2 h-10 sticky top-0 z-5">
                     Status
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* table body */}
            <div className="overflow-auto max-h-[500px] h-[500px] min-w-[700px] w-full">
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-100 text-text-body text-md font-medium leading-5 tracking-tight">
                  {Withdrawals.map((withdrawal) => (
                    <tr
                    onClick={()=> router.push("/dashboardAdmin/finance/withdrawal-requests/"+withdrawal._id)}
                    tabIndex={1}
                      key={withdrawal._id.toString()}
                      className="hover:bg-gray-200 transition-colors cursor-pointer text-center"
                    >
                      
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap font-bold overflow-hidden">
                        {withdrawal._id}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap font-bold overflow-hidden">
                        {withdrawal.user.email}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        ₦{withdrawal.amount}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {new Date(withdrawal.createdAt).toDateString()}
                      </td>
                      <td className="w-30 max-w-30 pl-2 py-4 whitespace-nowrap">
                        {getStatusBadge(withdrawal.withdrawalStatus)}
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

export default AllWithdrawalReqeuestTable;
