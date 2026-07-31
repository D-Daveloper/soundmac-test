"use client";
import React from "react";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { useGetAllAdminDetails } from "@/util/customHooks/useQueries";
import { useRouter } from "next/navigation";

const AdminListView = () => {
  const router = useRouter();
  const { isLoading, data } = useGetAllAdminDetails();

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-2 md:px-5">
      <div className="mt-5 px-5">
        <h2 className="text-lg font-semibold text-primary">Admin Activity Log</h2>
        <p className="text-sm text-gray-500 mt-1">Select an admin to view their activity.</p>
      </div>

      <div className="mt-5 bg-white rounded-lg shadow-sm overflow-hidden border mx-2 border-gray-200 mb-10">
        {isLoading ? (
          <InlineLoadingScreen />
        ) : (
          <div className="overflow-auto max-h-[600px] w-full">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-200">
                <tr className="bg-primary-50 font-bold text-primary text-xs capitalize tracking-wider">
                  <th className="p-4 min-w-[220px]">Admin Name</th>
                  <th className="p-4 min-w-[130px]">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                {data?.admins.map((a: { id: string; name: string; role: string }) => (
                  <tr
                    key={a.id}
                    onClick={() => router.push(`/dashboardAdmin/activityLog/${a.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 whitespace-nowrap font-semibold text-gray-900">{a.name}</td>
                    <td className="p-4 whitespace-nowrap text-gray-500 capitalize">
                      {a.role === "super_admin" ? "Super Admin" : "Admin"}
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

export default AdminListView;