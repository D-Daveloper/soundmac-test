import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { ApiKeyData } from "@/app/type";
import useAxios from "@/util/customHooks/UseAxios";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const AllApiKeysTable = ({
  keys,
  isfetching,
}: {
  keys: ApiKeyData[];
  isfetching: boolean;
}) => {
  const qyeryClient = useQueryClient();
  const api = useAxios();
  const getStatusBadge = (status: "active" | "inactive") => {
    const styles = {
      active: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-[#2D68C4] text-white border-[#2D68C4]",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      inactive: "bg-error-500 text-white border-gray-200",
    };

    const icons = {
      active: "/tick-circle.svg",
      pending: "/info-circle.svg",
      completed: "/info-circle.svg",
      draft: "/info-circle.svg",
      inactive: "/info-circle.svg",
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

  async function handleRevokeApiKey(email: string) {
    try {
      const res = await api.patch("admin/more/api-key", { email });
      await qyeryClient.invalidateQueries({ queryKey: ["allApiKeys"] });
      toast.success(res.data?.msg || "Successful");
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error(error as string);
    }
  }
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
                    <th className="w-1/6 max-w-1/6 p-2 h-10 sticky top-0 z-5">
                      Name
                    </th>
                    <th className="w-1/6 max-w-1/6 p-2 h-10 sticky top-0 z-5">
                      Email
                    </th>
                    <th className="w-1/6 max-w-1/6 p-2 h-10 sticky top-0 z-5">
                      Last Used
                    </th>
                    <th className="w-1/6 max-w-1/6 p-2 h-10 sticky top-0 z-5">
                      Date Created
                    </th>
                    <th className="w-1/6 max-w-1/6 p-2 h-10 sticky top-0 z-5">
                      Status
                    </th>
                    <th className="w-1/6 max-w-1/6 p-2 h-10 sticky top-0 z-5"></th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* table body */}
            <div className="overflow-auto max-h-[500px] h-[500px] min-w-[700px] w-full">
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-100 text-text-body text-md font-medium leading-5 tracking-tight">
                  {keys.map((key) => (
                    <tr
                      key={key._id.toString()}
                      className="hover:bg-gray-200 transition-colors text-center"
                    >
                      <td className="w-1/6 max-w-1/6 pl-2 py-4 whitespace-nowrap font-bold overflow-hidden">
                        {key.name}
                      </td>
                      <td className="w-1/6 max-w-1/6 pl-2 py-4 whitespace-nowrap">
                        {key.userId.email}
                      </td>
                      <td className="w-1/6 max-w-1/6 pl-2 py-4 whitespace-nowrap">
                        {new Date(key.lastUsedAt).toDateString()}
                      </td>
                      <td className="w-1/6 max-w-1/6 pl-2 py-4 whitespace-nowrap">
                        {new Date(key.createdAt).toDateString()}
                      </td>
                      <td className="w-1/6 max-w-1/6 pl-2 py-4 whitespace-nowrap">
                        {getStatusBadge(key.isActive ? "active" : "inactive")}
                      </td>
                      <td className="w-1/6 max-w-1/6 pl-2 py-4 whitespace-nowrap">
                        <button
                          className={"bg-error-500 text-white px-3 py-1 rounded-lg hover:bg-error-600 transition-colors " + (key.isActive ? "" : " opacity-50 hover:cursor-not-allowed!")}
                          onClick={() => handleRevokeApiKey(key.userId.email)}
                          disabled={!key.isActive}
                        >
                          Revoke
                        </button>
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

export default AllApiKeysTable;
