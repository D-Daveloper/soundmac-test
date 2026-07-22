import React, { useState } from "react";
import { X, Copy } from "lucide-react";
import { ISupportRequest } from "@/util/models/supportRequestsModel";
import { handleCopy } from "@/util/middleware/functions";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Image from "next/image";

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ISupportRequest | null;
  onStatusChange: (
    status: "pending" | "in-progress" | "completed" | "rejected",
  ) => Promise<void>;
  getStatusBadge: (
    status: "pending" | "in-progress" | "completed" | "rejected",
  ) => React.JSX.Element;
  issubmitting?: boolean;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onStatusChange,
  getStatusBadge,
  issubmitting = false,
}) => {
  if (!isOpen || !ticket) return null;

  const handleStatusClick = async (
    newStatus: "pending" | "in-progress" | "completed" | "rejected",
  ) => {
    await onStatusChange(newStatus);
    onClose();
  };

  //  useEffect(() => {
  //     const anyModalOpen =
  //       showChangeUserTypeModal ||
  //       showDeactivateModal ||
  //       showSendNotificationModal;

  //     if (anyModalOpen) {
  //       document.body.style.overflow = "hidden";
  //     } else {
  //       document.body.style.overflow = "";
  //     }

  //     // cleanup
  //     return () => {
  //       document.body.style.overflow = "";
  //     };
  //   }, [showChangeUserTypeModal, showDeactivateModal, showSendNotificationModal]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
      {issubmitting ? (
        <InlineLoadingScreen />
      ) : (
        <div className="bg-white rounded-2xl w-full max-w-[700px] max-h-[90vh] shadow-2xl overflow-y-auto overscroll-contain">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base md:text-xl tracking-tight font-semibold text-gray-900">
                    {ticket.issueCategory}
                  </h2>
                  {getStatusBadge(ticket.issueStatus)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Message */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 text-lg leading-relaxed max-h-60 overflow-y-auto">
                {ticket.issueDetail}
              </p>
            </div>

            {/* User Info */}
            <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                  {ticket.user.profilePic ? (
                    <img
                      src={ticket.user.profilePic}
                      alt={ticket.user.firstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {ticket.user.firstName} {ticket.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()} |{" "}
                    {new Date(ticket.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Email with copy button */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">
                    {ticket.user.email}
                  </span>
                  <button
                    onClick={() => handleCopy(ticket.user.email)}
                    className=" hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Copy email"
                  >
                    <Copy size={18} className="text-gray-600" />
                  </button>
                </div>
                {ticket.screenshot && (
                  <div className="flex gap-2">
                    View Screenshot{"- "}
                    <a
                      aria-label="view screenshot"
                      href={ticket.screenshot}
                      target="_blank"
                      className="flex bg-primary-500 w-fit p-1 rounded-lg text-white! font-bold hover:bg-primary/80! transition-colors"
                    >
                      view
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="border-t border-gray-200 pt-6 sm:px-3 md:px-0">
              <div className="flex flex-wrap md:items-center gap-4">
                <span className="text-gray-700 font-medium">Mark as:</span>
                <button
                  onClick={() => handleStatusClick("in-progress")}
                  className="px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusClick("completed")}
                  className="px-6 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusClick("pending")}
                  className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// // Demo component showing usage
// const DemoApp: React.FC = () => {
//   const [isModalOpen, setIsModalOpen] = useState(true);
//   const [ticket, setTicket] = useState({
//     id: '1',
//     title: 'Technical Issue',
//     description: "Hi, I've been trying to upload my latest single for over a day, but the upload freezes at around 70% each time. I've tried switching browsers and devices, but nothing changes. Could someone look into this so I can get the track published?",
//     status: 'Pending' as const,
//     author: 'Thomas Storts',
//     avatar: '👤',
//     email: 'thomasstorts@gmail.com',
//     date: '23 Jan 26',
//     time: '12:00 PM'
//   });

//   const handleStatusChange = (ticketId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
//     console.log('Status changed:', ticketId, newStatus);
//     // Update the ticket status
//     setTicket(prev => ({ ...prev, status: newStatus }));

//     // TODO: Make API call
//     // await fetch(`/api/tickets/${ticketId}`, {
//     //   method: 'PATCH',
//     //   body: JSON.stringify({ status: newStatus })
//     // });
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg"
//       >
//         Open Support Ticket
//       </button>

//       <SupportTicketModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         ticket={ticket}
//         onStatusChange={handleStatusChange}
//       />
//     </div>
//   );
// };

// export default DemoApp;
