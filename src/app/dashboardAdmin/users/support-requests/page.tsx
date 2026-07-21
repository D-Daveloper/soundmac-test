"use client";

import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import ScrollableTabs from "@/app/dashboard/profile/Buttons";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import Image from "next/image";
import { useGetAllSupportRequests } from "@/util/customHooks/useQueries";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { ISupportRequest } from "@/util/models/supportRequestsModel";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { SupportTicketModal } from "./SupportRequestModal";

const profileInfoButtons = [
  {
    label: "All",
    query: "all",
  },
  {
    label: "Pending",
    query: "pending",
  },
  {
    label: "in-progress",
    query: "in-progress",
  },
  {
    label: "completed",
    query: "completed",
  },
];
const Page = () => {
  const queryClient = useQueryClient();
  const api = UseAxios();
  const [isSubmitting, setisSubmitting] = useState(false);
  const [isSubmittingSelectedticket, setisSubmittingSelectedticket] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ISupportRequest | null>(
    null,
  );
  const dashboardContext = useContext(DashboardContext);
  const { getParam, setParam } = useTabQuery();
  const [active, setActive] = useState<number>(0);
  const supportStatus = getParam("supportStatus");
  const [showFullSupportRequest, setshowFullSupportRequest] = useState(false);

  useEffect(() => {
    dashboardContext?.setHeader({title:"support Requests", showBackButton:true});
  }, []);

  useEffect(() => {
    if (supportStatus) {
      const index = profileInfoButtons.findIndex(
        (tab) => tab.query === supportStatus,
      );
      if (index !== -1) {
        setActive(index);
      }
    } else {
      setParam("supportStatus", "all");
    }
  }, [supportStatus]);

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId],
    );
  };

  const handleSelectAll = () => {
    if (allsupportRequests) {
      console.log(allsupportRequests.pages.flatMap((page) => page.data).length);

      if (
        selectedTickets.length ===
        allsupportRequests.pages.flatMap((page) => page.data).length
      ) {
        setSelectedTickets([]);
      } else {
        setSelectedTickets(
          allsupportRequests.pages
            .flatMap((page) => page.data)
            .map((t) => t._id),
        );
      }
    }
  };

  const handleStatusChange = async (
    newStatus: "pending" | "in-progress" | "completed" | "rejected",
  ): Promise<void> => {
    try {
      if (selectedTickets.length === 0 && !selectedTicket) {
        toast.error("No tickets selected");
        return;
      }
      let res;
      if (selectedTicket) {
        setisSubmittingSelectedticket(true);
        res = await api.post("/admin/users/support-requests", {
          ids: [selectedTicket._id],
          newStatus,
        });
      } else {
        setisSubmitting(true);
        res = await api.post("/admin/users/support-requests", {
          ids: selectedTickets,
          newStatus: newStatus,
        });
      }
      console.log(
        "Updating tickets:",
        selectedTickets,
        "to status:",
        newStatus,
      );
      toast.success(res.data.msg || "Tickets updated successfully");
      await queryClient.invalidateQueries({
        queryKey: ["admin-all-support-requests", supportStatus],
      });
      if (!selectedTicket) {
        // Clear selection only if we updated multiple tickets. If we updated a single ticket via the modal, we want to keep the selection so the user can easily update it again if needed.
        setSelectedTickets([]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setisSubmitting(false);
      setisSubmittingSelectedticket(false);
    }
  };

  const getStatusBadge = (status: ISupportRequest["issueStatus"]) => {
    const styles = {
      completed: "bg-green-100 text-green-700 border-green-200",
      "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-[#2D68C4] text-white border-[#2D68C4]",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      pending: "bg-error-500 text-white border-gray-200",
    };

    const icons = {
      completed: "/tick-circle.svg",
      "in-progress": "/info-circle.svg",
      rejected: "/info-circle.svg",
      draft: "/info-circle.svg",
      pending: "/info-circle.svg",
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
  const {
    data: allsupportRequests,
    isFetching: isFetchingAllArtists,
    isFetchingNextPage,
    // isRefetching:isRefecthingreleaseRequests,
    isError: isWithdrawalError,
    hasNextPage,
    status,
    fetchNextPage,
  } = useGetAllSupportRequests({
    supportStatus: supportStatus || "all",
    limit: "50",
  });

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
      <div className="max-w-6xl">
        <div className="flex gap-3 mt-5 flex-wrap">
          <ScrollableTabs
            tabs={profileInfoButtons}
            onChange={(index) => {
              setParam("supportStatus", profileInfoButtons[index].query);
            }}
            active={active}
          />
        </div>
        {/* Select All Checkbox */}
        {allsupportRequests && allsupportRequests.pages[0].data.length > 0 && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <input
              type="checkbox"
              checked={
                selectedTickets.length ===
                allsupportRequests.pages.flatMap((page) => page.data).length
              }
              onChange={handleSelectAll}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedTickets.length > 0
                ? `${selectedTickets.length} ticket${selectedTickets.length > 1 ? "s" : ""} selected`
                : "Select all tickets"}
            </span>
          </div>
        )}

        {status === "pending" || !allsupportRequests || isSubmitting ? (
          <InlineLoadingScreen />
        ) : (
          <>
            {allsupportRequests.pages[0].data.length < 1 ? (
              <div className="flex flex-col justify-center items-center h-[80dvh] gap-15 ">
                <div>
                  <Image
                    priority={true}
                    src={"/manage_song_image.png"}
                    alt="an image depicting no request releases"
                    width={100}
                    height={100}
                  />
                </div>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
                  There are no {supportStatus != "all" && supportStatus} support
                  requests Right Now.
                </p>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Tickets List */}
                <div className="flex-1 space-y-4 h-[500px] overflow-y-auto pr-2">
                  {allsupportRequests.pages.map((page) =>
                    page.data.map((ticket) => (
                      <div
                        key={ticket._id}
                        className={`bg-neutral-50 rounded-lg border-2 p-6 cursor-pointer transition-all ${
                          selectedTickets.includes(ticket._id)
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-4" tabIndex={0} onClick={() => {
                          setSelectedTicket(ticket);
                          setshowFullSupportRequest(true);
                        }}>
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket._id)}
                            onChange={() => handleTicketSelect(ticket._id)}
                            className="mt-1 w-5 h-5 cursor-pointer accent-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          />

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-primary-500">
                                {ticket.issueCategory}
                              </h3>
                              {getStatusBadge(ticket.issueStatus)}
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {ticket.issueDetail}
                            </p>

                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                {ticket.user.profilePic ? (
                                  <Image
                                    src={ticket.user.profilePic}
                                    alt={ticket.user.firstName}
                                    width={32}
                                    height={32}
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-700">
                                      {ticket.user.firstName.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {ticket.user.firstName} {ticket.user.lastName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  ticket.createdAt,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">|</span>
                              <span className="text-sm text-gray-500">
                                {new Date(ticket.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )),
                  )}
                  <div className="flex justify-center">
                    <button
                      className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white! bg-primary-500 "
                      onClick={() => fetchNextPage()}
                      disabled={!hasNextPage || isFetchingAllArtists}
                    >
                      {isFetchingNextPage
                        ? "Loading more..."
                        : hasNextPage
                          ? "Load More"
                          : "Nothing more to load"}
                    </button>
                  </div>
                </div>

                {/* Status Change Sidebar - Only shows when tickets are selected */}
                {selectedTickets.length > 0 && (
                  <div className="w-64 bg-secondary-50 rounded-xl border border-neutral-100 p-6 h-fit sticky top-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-900">Mark as:</h3>
                      <button
                        onClick={() => setSelectedTickets([])}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-3 text-white">
                      <button
                        onClick={() => handleStatusChange("in-progress")}
                        className="w-full px-4 py-3 bg-warning-500 rounded-lg font-medium hover:bg-warning-500/80 transition-colors text-left"
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() => handleStatusChange("completed")}
                        className="w-full px-4 py-3 bg-success-500  rounded-lg font-medium hover:bg-success-500/80 transition-colors text-left"
                      >
                        Completed
                      </button>

                      <button
                        onClick={() => handleStatusChange("pending")}
                        className="w-full px-4 py-3 bg-error-500  rounded-lg font-medium hover:bg-error-500/80 transition-colors text-left"
                      >
                        Pending
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {selectedTickets.length} ticket
                        {selectedTickets.length > 1 ? "s" : ""} will be updated
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <SupportTicketModal
          isOpen={showFullSupportRequest}
          onClose={() => {
            setshowFullSupportRequest(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          onStatusChange={handleStatusChange}
          getStatusBadge={getStatusBadge}
          issubmitting={isSubmittingSelectedticket}
        />
      </div>
    </div>
  );
};

export default Page;
