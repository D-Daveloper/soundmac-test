import React, { useState } from "react";
import { Music, X } from "lucide-react";
import Image from "next/image";
import { AdminRelease } from "@/app/type";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ModelLoadingScreen } from "@/app/components/Loader/loader";

interface ReleaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onApprove: () => void;
  // onReject: (reason: string) => void;
  releaseDetails?: AdminRelease;
}

export const ReleaseDetailsModal: React.FC<ReleaseDetailsModalProps> = ({
  isOpen,
  onClose,
  // onApprove,
  // onReject,
  releaseDetails,
}) => {
  const queryClient = useQueryClient();
  const api = UseAxios();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      handleRejectRelease();
      setShowRejectModal(false);
      setRejectReason("");
    }
  };
  console.log(releaseDetails);

  const handleApproveRelease = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post("admin/all-releases/singles", {
        songId: releaseDetails?._id,
        requestType: "approved",
      });
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({ queryKey: ["allreleases"] });
      if (releaseDetails) {
        releaseDetails.releaseStatus = "approved";
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong!");
    } finally {
      setisSubmitting(false);
    }
  };

  const handleRejectRelease = async () => {
    try {
      setisSubmitting(true);
      if (!rejectReason) {
        return toast.warn("Please enter the reason for the rejected.");
      }
      const res = await api.post("admin/all-releases/singles", {
        songId: releaseDetails?._id,
        requestType: "rejected",
        message: rejectReason,
      });
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({ queryKey: ["single",] });
      if (releaseDetails) {
        releaseDetails.releaseStatus = "rejected";
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong!");
    } finally {
      setisSubmitting(false);
    }
  };

  const handleDownloadSong = async () => {
    try {
      setisSubmitting(true);
      const res = await api.get("admin/all-releases/singles", {
        params: { songId: releaseDetails?._id },
      });
      console.log(res.data);
      // 2. Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = res.data.downloadUrl;
      link.download = res.data.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Append to body (required for Firefox)
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);

      toast.success(res.data.msg);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong!");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Modal Backdrop */}
      {releaseDetails && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center z-50">
          {/* Main Modal */}
          <div className="bg-white rounded-2xl w-[900px] max-h-[70vh] overflow-auto shadow-2xl p-1">
            {isSubmitting ? (
              <div className="h-[60vh]">
                <ModelLoadingScreen />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <h2 className="text-2xl font-medium text-main-heading">
                    Release Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Cover Art and Download Section */}
                  <div className="bg-secondary-50 rounded-xl p-3 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Album Art Placeholder */}
                      <div className=" relative overflow-hidden w-10 h-10">
                        <Image
                          priority={false}
                          src={
                            releaseDetails.releaseImage || "/signinimage.png"
                          }
                          alt="release image"
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <a
                        aria-label="download cover art"
                        download="releaseImage"
                        href={releaseDetails.releaseImage || "/signinimage.png"}
                        target="_blank"
                        className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                      >
                        {/* Icon placeholder - add your download icon here */}
                        <Image
                          priority={false}
                          src={"/arrow-down.svg"}
                          alt="download cover icon"
                          width={20}
                          height={20}
                        />
                        Download Cover Art
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleDownloadSong}
                        aria-label="download music"
                        className="flex items-center gap-2 text-primary-500 font-bold hover:text-primary/90 transition-colors"
                      >
                        {/* Icon placeholder - add your music note icon here */}
                        <div className="w-fit h-fit p-2 rounded-lg bg-neutral-100">
                          <Music />
                        </div>
                        Download Audio file
                      </button>
                      <button className="w-fit h-fit px-4 py-2 bg-primary-500 rounded-lg flex items-center justify-center text-white hover:bg-primary-500/90 transition-colors">
                        {/* Icon */}
                        <Image
                          priority={false}
                          src={"/play-circle.svg"}
                          alt="play icon"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Song Details Grid */}
                  <div className="flex flex-col gap-x-12">
                    <div className="flex ">
                      {/* Song Name */}
                      <div className="flex-1">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Song name
                        </p>
                        <p className="text-gray-900 text-lg font-medium">
                          {releaseDetails.releaseTitle}
                        </p>
                      </div>

                      {/* Artist */}
                      <div className="flex-1">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Artist
                        </p>
                        <div>
                          <p className="text-gray-900 text-lg font-medium mb-1">
                            {releaseDetails.artistName}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              {/* Spotify icon placeholder */}
                              <Image
                                priority={false}
                                src={"/spotify.svg"}
                                alt="search icon"
                                width={20}
                                height={20}
                              />
                              <span className="text-sm text-gray-600">
                                {releaseDetails.artist.spotifyId}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Apple Music icon placeholder */}
                              <Image
                                priority={false}
                                src={"/applemusic.svg"}
                                alt="search icon"
                                width={20}
                                height={20}
                              />
                              <span className="text-sm text-gray-600">
                                {releaseDetails.artist.appleId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* border line */}
                    <div className="border border-neutral-100 mb-6"></div>

                    <div className="flex">
                      {/* Genre */}
                      <div className="flex-1">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Genre
                        </p>
                        <p className="text-gray-900 text-lg font-medium">
                          {releaseDetails.genre}
                        </p>
                      </div>

                      {/* Release Date */}
                      <div className="flex-1">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Release Date
                        </p>
                        <p className="text-gray-900 text-lg font-medium">
                          {new Date(releaseDetails.releaseDate).toDateString()}
                        </p>
                      </div>
                    </div>
                    {/* border line */}
                    <div className="border border-neutral-100 mb-6"></div>
                  </div>

                  {/* Featured Artists */}
                  <div>
                    <p className="text-text-disable font-bold text-sm mb-1">
                      Featured Artists
                    </p>
                    <div className="flex w-full gap-2 overflow-x-auto max-w-[700px]">
                      {releaseDetails.featuredArtist.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-5 bg-neutral-100 px-2 rounded-md w-fit whitespace-nowrap"
                        >
                          <p className="text-gray-900 text-lg font-medium min-w-fit px-2">
                            {item.artistName} |
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Image
                              priority={false}
                              src={"/spotify.svg"}
                              alt="search icon"
                              width={20}
                              height={20}
                            />
                            <span className="text-sm text-gray-600">
                              {"item.spotifyId"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Image
                              priority={false}
                              src={"/applemusic.svg"}
                              alt="search icon"
                              width={20}
                              height={20}
                            />
                            <span className="text-sm text-gray-600 pr-5">
                              {"item.appleId"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>
                  {/* Songwriter and Producer */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="relative max-w-[400px]">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Song Writers
                      </p>
                      <div
                        className="text-gray-900 text-lg font-medium whitespace-nowrap overflow-x-auto"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                        {releaseDetails.songWriter
                          .map((item) => item.first_name)
                          .join(", ")}
                      </div>
                      {/* fade hint on the right */}
                      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                    </div>
                    <div>
                      <div className="relative max-w-[400px]">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Producers
                        </p>
                        <div
                          className="text-gray-900 text-lg font-medium whitespace-nowrap overflow-x-auto"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                          {releaseDetails.producer
                            .map((item) => item.name)
                            .join(", ")}{" "}
                        </div>
                        {/* fade hint on the right */}
                        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {releaseDetails?.releaseStatus === "pending" && (
                    <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-6 py-2 bg-white border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleApproveRelease}
                        className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl">
            {/* Reject Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Reject Release
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reject Modal Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this release:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Enter rejection reason..."
              />

              {/* Reject Modal Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// // Demo Component to show how to use the modal
// const DemoApp: React.FC = () => {
//   const [isModalOpen, setIsModalOpen] = useState(true);

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
//       >
//         Open Release Details
//       </button>

//       <ReleaseDetailsModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onApprove={() => {
//           alert("Release approved!");
//           setIsModalOpen(false);
//         }}
//         onReject={(reason) => {
//           alert(`Release rejected. Reason: ${reason}`);
//         }}
//       />
//     </div>
//   );
// };

// export default DemoApp;
