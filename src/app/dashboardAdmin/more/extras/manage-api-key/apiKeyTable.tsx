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
  const queryClient = useQueryClient(); // Fixed typo 'qyeryClient'
  const api = useAxios();

  const getStatusBadge = (status: "active" | "inactive") => {
    const styles = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-red-100 text-red-700 border-red-200", // Standardized to clean alert red
    };

    const icons = {
      active: "/tick-circle.svg",
      inactive: "/info-circle.svg",
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

  async function handleRevokeApiKey(email: string) {
    try {
      const res = await api.patch("admin/more/api-key", { email });
      await queryClient.invalidateQueries({ queryKey: ["allApiKeys"] });
      toast.success(res.data?.msg || "Successfully revoked API key");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        toast.error(error.response?.data?.msg || "An error occurred");
        return;
      }
      toast.error(error as string);
    }
  }

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
                  <th className="p-4 min-w-[180px]">Name</th>
                  <th className="p-4 min-w-[250px]">Email</th>
                  <th className="p-4 min-w-[160px]">Last Used</th>
                  <th className="p-4 min-w-[160px]">Date Created</th>
                  <th className="p-4 min-w-[130px] text-center">Status</th>
                  <th className="p-4 min-w-[120px] text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                {keys.map((key) => (
                  <tr
                    key={key._id.toString()}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="p-4 whitespace-nowrap text-gray-900 font-semibold truncate max-w-[180px]">
                      {key.name}
                    </td>

                    {/* User Email */}
                    <td className="p-4 whitespace-nowrap text-gray-900 truncate max-w-[250px]">
                      {key.userId?.email || "N/A"}
                    </td>

                    {/* Last Used Date */}
                    <td className="p-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Never"}
                    </td>

                    {/* Date Created */}
                    <td className="p-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {new Date(key.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap text-center">
                      {getStatusBadge(key.isActive ? "active" : "inactive")}
                    </td>

                    {/* Actions Button */}
                    <td className="p-4 whitespace-nowrap text-right">
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                          key.isActive
                            ? "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-100 active:scale-95"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleRevokeApiKey(key.userId?.email || "")}
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
        )}
      </div>
    </div>
  );
};

export default AllApiKeysTable;