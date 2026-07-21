"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { IUser } from "@/util/models/userModel";

interface AllUsersTableProps {
  users: IUser[];
  isfetching: boolean;
}

const AllUsersTable: React.FC<AllUsersTableProps> = ({ users, isfetching }) => {
  const router = useRouter();

  const getStatusBadge = (status: IUser["userStatus"]) => {
    const styles = {
      active: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-[#2D68C4] text-white border-[#2D68C4]",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      inactive: "bg-red-500 text-white border-red-500",
    };

    const icons = {
      active: "/tick-circle.svg",
      pending: "/info-circle.svg",
      completed: "/info-circle.svg",
      draft: "/info-circle.svg",
      inactive: "/info-circle.svg",
    };

    const badgeStyle = styles[status] || styles.draft;
    const badgeIcon = icons[status] || icons.draft;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}
      >
        <Image
          priority={false}
          src={badgeIcon}
          alt={`${status} status icon`}
          width={10}
          height={10}
        />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const handleRowClick = (userId: string) => {
    router.push(`/dashboardAdmin/users/manage-users/${userId}?tab=user-info`);
  };

  return (
    <div className="w-full bg-gray-50 sm:p-2 pb-0">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {isfetching ? (
          <div className="p-8">
            <InlineLoadingScreen />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] w-full">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="bg-primary-50 sticky top-0 z-10 border-b border-gray-200">
                <tr className="font-extrabold text-primary-500 text-center text-xs uppercase tracking-wider">
                  <th scope="col" className="px-4 py-3 min-w-[200px] text-left">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 w-[200px] text-left">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    Account Type
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    Referral Code
                  </th>
                  <th scope="col" className="px-4 py-3 w-[150px]">
                    Date Joined
                  </th>
                  <th scope="col" className="px-4 py-3 w-[120px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-text-body text-sm font-medium">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user._id.toString()}
                      onClick={() => handleRowClick(user._id.toString())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(user._id.toString());
                        }
                      }}
                      tabIndex={0}
                      className="hover:bg-gray-50 transition-colors cursor-pointer text-center focus:outline-none focus:bg-gray-100"
                    >
                      {/* User Info / Avatar */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full border border-neutral-200 overflow-hidden flex-shrink-0">
                            <Image
                              src={user.profilePic || "/signinimage.png"}
                              fill
                              alt={`${user.firstName || "User"}'s avatar`}
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                            {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-left font-medium text-gray-700 truncate max-w-[200px]">
                        {user.email}
                      </td>

                      {/* Account Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {user.type || "FREE_ARTIST"}
                      </td>

                      {/* Referral Code */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-500">
                        {user.referralCode || "No Code"}
                      </td>

                      {/* Date Joined */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toDateString()
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStatusBadge(user.userStatus)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No users found.
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

export default AllUsersTable;