import React from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

const getPlatformBadge = (status: "pending" | "live") => {
  const styles = {
    live: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const icons = { live: "/tick-circle.svg", pending: "/info-circle.svg" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${styles[status]}`}>
      <Image priority={false} src={icons[status]} alt="status icon" width={10} height={10} />
      {status === "live" ? "Live" : "Pending"}
    </span>
  );
};

const DeliveryLogTable = ({ releases, isfetching }: { releases: any[]; isfetching: boolean }) => {
  const getPlatformStatus = (release: any, platform: "spotify" | "apple_music") => {
    const entry = release.platformDelivery.find((p: any) => p.platform === platform);
    return getPlatformBadge(entry?.status ?? "pending");
  };

  return (
    <div className="w-full bg-gray-50 p-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {isfetching ? (
          <InlineLoadingScreen />
        ) : (
          <div className="overflow-auto max-h-[550px] w-full">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-200 shadow-[0_1px_0_0_rgba(229,231,235,1)]">
                <tr className="bg-primary-50 font-bold text-primary-500 text-xs capitalize tracking-wider">
                  <th className="p-4 min-w-[220px]">Release Name</th>
                  <th className="p-4 min-w-[150px]">Artist</th>
                  <th className="p-4 min-w-[150px]">Release Date</th>
                  <th className="p-4 min-w-[150px]">Created Date</th>
                  <th className="p-4 min-w-[150px]">Approved Date</th>
                  <th className="p-4 min-w-[130px]">Spotify</th>
                  <th className="p-4 min-w-[130px]">Apple Music</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                {releases.map((release) => (
                  <tr key={release._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden border border-gray-100">
                          <Image src={release.releaseImage || "/signinimage.png"} fill alt="Release cover" className="object-cover" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[180px]">{release.releaseTitle}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-900 font-semibold truncate max-w-[150px]">{release.artistName}</td>
                    <td className="p-4 whitespace-nowrap text-gray-500">{formatDate(release.releaseDate)}</td>
                    <td className="p-4 whitespace-nowrap text-gray-500">{formatDate(release.createdAt)}</td>
                    <td className="p-4 whitespace-nowrap text-gray-500">{formatDate(release.approvedAt)}</td>
                    <td className="p-4 whitespace-nowrap">{getPlatformStatus(release, "spotify")}</td>
                    <td className="p-4 whitespace-nowrap">{getPlatformStatus(release, "apple_music")}</td>
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

export default DeliveryLogTable;