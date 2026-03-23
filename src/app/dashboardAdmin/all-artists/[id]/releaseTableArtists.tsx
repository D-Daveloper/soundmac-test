import React, { useState } from "react";
import { AdminRelease } from "@/app/type";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";

const ReleaseTable = ({
  releases,
  isfetching,
}: {
  releases: AdminRelease[];
  isfetching: boolean;
}) => {
  const getStatusBadge = (status: AdminRelease["releaseStatus"]) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-[#2D68C4] text-white border-[#2D68C4]",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      rejected: "bg-error-500 text-white border-gray-200",
    };

    const icons = {
      approved: "/tick-circle.svg",
      pending: "/info-circle.svg",
      completed: "/info-circle.svg",
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
                      Release Name
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Artist
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Catalog No.
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5 uppercase">
                      ISRC
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5 uppercase">
                      UPC
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Release Date
                    </th>
                    <th className="w-50 max-w-50 p-2 h-10 sticky top-0 z-5">
                      Status
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* table body */}
            <div className={"overflow-auto max-h-[500px] h-[500px] min-w-[700px] w-full " + (isfetching && "shimmer")}>
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-100 text-text-body text-md font-medium leading-5 tracking-tight">
                  {releases.map((release) => (
                    <tr
                      key={release._id}
                      className="hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <td className="min-w-50 pl-2 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "relative max-w-[40px] max-h-[40px] min-w-[40px] h-[40px] rounded-2xl border border-neutral-100"
                            }
                          >
                            <Image
                              src={release.releaseImage || "/signinimage.png"}
                              fill
                              alt="music note icon"
                              className={" object-cover rounded-md "}
                            />
                          </div>
                          <span className="">{release.releaseTitle}</span>
                        </div>
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap font-bold">
                        {release.artistName}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {release.catalogNumber}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {release?.isrc || "Album"}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {release.upc}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {new Date(release.releaseDate).toDateString()}
                      </td>
                      <td className="w-50 max-w-50 pl-2 py-4 whitespace-nowrap">
                        {getStatusBadge(release.releaseStatus)}
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

export default ReleaseTable;
