import React, { useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { IUser } from "@/util/models/userModel";
import { useRouter } from "next/navigation";

const AllUsersTable = ({
  users,
  isfetching,
}: {
  users: IUser[];
  isfetching: boolean;
}) => {
  const getStatusBadge = (status: IUser["userStatus"]) => {
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
                    <th className="min-w-50 p-2 h-10 sticky top-0 z-5">
                       Name
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Email
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Account Type
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Referral code
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      data joined
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
                  {users.map((user) => (
                    <tr
                    onClick={()=> router.push("/dashboardAdmin/users/manage-users/"+user._id + "?tab=user-info")}
                    tabIndex={1}
                      key={user._id.toString()}
                      className="hover:bg-gray-200 transition-colors cursor-pointer text-center"
                    >
                      <td className="min-w-50 pl-2 py-4 whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "relative max-w-[40px] max-h-[40px] min-w-[40px] h-[40px] rounded-2xl border border-neutral-100"
                            }
                          >
                            <Image
                              src={user.profilePic ||"/signinimage.png"}
                              fill
                              alt="music note icon"
                              className={" object-cover rounded-md "}
                            />
                          </div>
                          <span className="">{user.firstName}</span><span className="">{user.lastName}</span>
                        </div>
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap font-bold overflow-hidden">
                        {user.email}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {user.type || "FREE_ARTIST"}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {user.referralCode || "No Code"}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {new Date(user.createdAt).toDateString()}
                      </td>
                      <td className="w-30 max-w-30 pl-2 py-4 whitespace-nowrap">
                        {getStatusBadge(user.userStatus)}
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

export default AllUsersTable;
