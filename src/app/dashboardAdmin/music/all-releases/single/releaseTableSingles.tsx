import React, { useState } from "react";
import { AdminRelease } from "@/app/type";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { ReleaseDetailsModal } from "./releaseDetailsModel";

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
      rejected: "bg-red-100 text-red-700 border-red-200", // Standardized to red
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

  const [selectedRelease, setselectedRelease] = useState<AdminRelease | null>(null);

  return (
    <div className="w-full bg-gray-50 p-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {isfetching ? (
          <InlineLoadingScreen />
        ) : (
          <>
            {/* Unified Scrollable Container */}
            <div className="overflow-auto max-h-[550px] w-full">
              <table className="w-full border-collapse text-left text-sm">
                {/* Sticky Header */}
                <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-200 shadow-[0_1px_0_0_rgba(229,231,235,1)]">
                  <tr className="bg-primary-50 font-bold text-primary-500 text-xs capitalize tracking-wider">
                    <th className="p-4 min-w-[200px]">Release Name</th>
                    <th className="p-4 min-w-[150px]">Artist</th>
                    <th className="p-4 min-w-[150px]">Catalog No.</th>
                    <th className="p-4 min-w-[180px] uppercase">ISRC</th>
                    <th className="p-4 min-w-[180px] uppercase">UPC</th>
                    <th className="p-4 min-w-[150px]">Release Date</th>
                    <th className="p-4 min-w-[130px]">Status</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                  {releases.map((release) => (
                    <tr
                      onClick={() => setselectedRelease(release)}
                      tabIndex={0}
                      key={release._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:bg-gray-50"
                    >
                      {/* Release Name */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden border border-gray-100">
                            <Image
                              src={release.releaseImage || "/signinimage.png"}
                              fill
                              alt="Release cover"
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-gray-900 truncate max-w-[180px]">
                            {release.releaseTitle}
                          </span>
                        </div>
                      </td>

                      {/* Artist */}
                      <td className="p-4 whitespace-nowrap text-gray-900 font-semibold truncate max-w-[150px]">
                        {release.artistName}
                      </td>

                      {/* Catalog Number */}
                      <td className="p-4 whitespace-nowrap text-gray-500 truncate max-w-[150px]">
                        {release.catalogNumber}
                      </td>

                      {/* ISRC */}
                      <td className="p-4 whitespace-nowrap text-gray-500 select-all font-mono">
                        {release.isrc}
                      </td>

                      {/* UPC */}
                      <td className="p-4 whitespace-nowrap text-gray-500 select-all font-mono">
                        {release.upc}
                      </td>

                      {/* Release Date */}
                      <td className="p-4 whitespace-nowrap text-gray-500">
                        {new Date(release.releaseDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(release.releaseStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal */}
            <ReleaseDetailsModal
              isOpen={selectedRelease != null}
              onClose={() => setselectedRelease(null)}
              releaseDetails={selectedRelease ? selectedRelease : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReleaseTable;