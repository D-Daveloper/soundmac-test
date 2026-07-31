"use client";
import React, { useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { usePaginatedAdminActivityLog } from "@/util/customHooks/useQueries";
import Pagination from "@/app/components/pagination/Pagination";
import { ADMIN_ACTIONS } from "@/util/lib/adminActivityLog/adminActivityLogHelper";
import Select from "@/components/Select";

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ActivityLogTable = ({ adminId }: { adminId: string }) => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("none");
  const [entityType, setEntityType] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { isLoading, data, isFetching } = usePaginatedAdminActivityLog({
    page,
    limit: "50",
    admin: adminId,
    action,
    entityType,
    startDate,
    endDate,
  });

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-2 md:px-4 lg:px-10">
      <div className="w-full flex flex-col md:flex-row gap-4 md:items-end mt-5 lg:mx-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setPage(1);
              setStartDate(e.target.value);
            }}
            className="border border-gray-200 rounded-lg p-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setPage(1);
              setEndDate(e.target.value);
            }}
            className="border border-gray-200 rounded-lg p-2 text-sm"
          />
        </div>

        <div className="flex w-[65%] flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Action</label>
          <Select
            selected={action}
            setSelected={(v) => {
              setPage(1);
              setAction(v);
            }}
            placeholder="All actions"
            options={["none", ...ADMIN_ACTIONS]}
            name="action"
          />
        </div>
      </div>

      {isLoading ? (
        <InlineLoadingScreen />
      ) : !data || data.data.length < 1 ? (
        <div className="flex flex-col justify-center items-center h-[60dvh] gap-6">
          <p className="text-text-body text-[16px] text-center">
            No activity recorded yet.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col mb-10">
          <div className="w-full bg-gray-50 p-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              {isFetching ? (
                <InlineLoadingScreen />
              ) : (
                <div className="overflow-auto max-h-[550px] w-full">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-200">
                      <tr className="bg-primary-50 font-bold text-primary-500 text-xs capitalize tracking-wider">
                        <th className="p-4 min-w-[160px]">Admin</th>
                        <th className="p-4 min-w-[180px]">Action</th>
                        <th className="p-4 min-w-[130px]">Entity Type</th>
                        <th className="p-4 min-w-[220px]">Entity</th>
                        <th className="p-4 min-w-[180px]">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                      {data.data.map((entry: any) => (
                        <tr
                          key={entry._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 whitespace-nowrap font-semibold text-gray-900">
                            {entry.adminName}
                          </td>
                          <td className="p-4 whitespace-nowrap text-gray-500">
                            {entry.action}
                          </td>
                          <td className="p-4 whitespace-nowrap text-gray-500 capitalize">
                            {entry.entityType}
                          </td>
                          <td className="p-4 whitespace-nowrap text-gray-500 truncate max-w-[220px]">
                            {entry.entityLabel}
                          </td>
                          <td className="p-4 whitespace-nowrap text-gray-500">
                            {formatDateTime(entry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="px-0 md:px-2">
            <div className="border-t border-gray-200 py-4 px-2 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between rounded-lg">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * data.limit + 1} to{" "}
                {Math.min(
                  (page - 1) * data.limit + data.limit,
                  data.totalCount,
                )}{" "}
                of {data.totalCount} results
              </div>
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onChange={(p) => setPage(p)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogTable;
