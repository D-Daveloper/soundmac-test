import React, { useState } from "react";
import { Music, X } from "lucide-react";
import Image from "next/image";
import { AdminRelease } from "@/app/type";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { ModelLoadingScreen } from "@/app/components/Loader/loader";

interface ReleaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseDetails?: AdminRelease;
}

export const ReleaseDetailsModal: React.FC<ReleaseDetailsModalProps> = ({
  isOpen,
  onClose,
  releaseDetails,
}) => {
  const api = UseAxios();
  const [isSubmitting, setisSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadSong = async () => {
    try {
      setisSubmitting(true);
      const res = await api.get("admin/music/all-releases/singles", {
        params: { songId: releaseDetails?._id },
      });
      console.log('release detaisl', res.data);
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
  console.log('release detaisl', releaseDetails?._id);

  return (
    <>
      {/* Main Modal Backdrop */}
      {releaseDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Main Modal Wrapper - Responsive width and screen constraint */}
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {isSubmitting ? (
              <div className="h-[60vh] flex items-center justify-center">
                <ModelLoadingScreen />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                  <h2 className="text-xl md:text-2xl font-semibold text-main-heading">
                    Release Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Scrollable Content Container */}
                <div className="p-4 md:p-6 overflow-y-auto space-y-6">
                  {/* Cover Art and Download Section (Responsive Row-to-Column) */}
                  <div className="bg-secondary-50 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Side: Art + Art Download */}
                    <div className="flex items-center gap-3">
                      <div className="relative overflow-hidden w-12 h-12 flex-shrink-0">
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
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-500 font-bold hover:opacity-90 transition-opacity"
                      >
                        <Image
                          priority={false}
                          src="/arrow-down.svg"
                          alt="download cover icon"
                          width={18}
                          height={18}
                        />
                        <span>Download Cover Art</span>
                      </a>
                    </div>

                    {/* Right Side: Audio Download & Play */}
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-200/50">
                      <button
                        onClick={handleDownloadSong}
                        aria-label="download music"
                        className="flex items-center gap-2 text-sm text-primary-500 font-bold hover:opacity-90 transition-all"
                      >
                        <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                          <Music size={18} />
                        </div>
                        <span>Download Audio File</span>
                      </button>

                      <button className="p-3 bg-primary-500 rounded-lg flex items-center justify-center text-white hover:bg-primary-500/90 transition-all">
                        <Image
                          priority={false}
                          src="/play-circle.svg"
                          alt="play icon"
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Song Details Grid (Uniform responsive system) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Song Name */}
                    <div className="space-y-1">
                      <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                        Song name
                      </p>
                      <p className="text-gray-900 text-base md:text-lg font-medium">
                        {releaseDetails.releaseTitle}
                      </p>
                    </div>

                    {/* Artist Details & Streaming Links */}
                    <div className="space-y-1">
                      <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                        Artist
                      </p>
                      <div>
                        <p className="text-gray-900 text-base md:text-lg font-medium">
                          {releaseDetails.artistName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          {releaseDetails.artist?.spotifyId && (
                            <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded border border-neutral-100">
                              <Image
                                src="/spotify.svg"
                                alt="Spotify"
                                width={16}
                                height={16}
                              />
                              <span className="text-xs text-gray-600">
                                {releaseDetails.artist.spotifyId}
                              </span>
                            </div>
                          )}
                          {releaseDetails.artist?.appleId && (
                            <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded border border-neutral-100">
                              <Image
                                src="/applemusic.svg"
                                alt="Apple Music"
                                width={16}
                                height={16}
                              />
                              <span className="text-xs text-gray-600">
                                {releaseDetails.artist.appleId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-b md:col-span-2 border-neutral-100 my-1"></div>

                    {/* Genre */}
                    <div className="space-y-1">
                      <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                        Genre
                      </p>
                      <p className="text-gray-900 text-base md:text-lg font-medium">
                        {releaseDetails.genre}
                      </p>
                    </div>

                    {/* Release Date */}
                    <div className="space-y-1">
                      <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                        Release Date
                      </p>
                      <p className="text-gray-900 text-base md:text-lg font-medium">
                        {new Date(releaseDetails.releaseDate).toDateString()}
                      </p>
                    </div>

                    <div className="border-b md:col-span-2 border-neutral-100 my-1"></div>

                    {/* Featured Artists Section (With elegant custom scroll wrapper) */}
                    {releaseDetails.featuredArtist &&
                      releaseDetails.featuredArtist.length > 0 && (
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                            Featured Artists
                          </p>
                          <div className="flex w-full gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {releaseDetails.featuredArtist.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="flex flex-shrink-0 items-center gap-3 bg-neutral-50 border border-neutral-150 px-3 py-1.5 rounded-lg"
                                >
                                  <p className="text-gray-900 text-sm font-semibold border-r border-neutral-300 pr-2.5">
                                    {item.artistName}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/spotify.svg"
                                      alt="Spotify"
                                      width={16}
                                      height={16}
                                    />
                                    <span className="text-xs text-gray-600">
                                      {item.spotifyId}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/applemusic.svg"
                                      alt="Apple Music"
                                      width={16}
                                      height={16}
                                    />
                                    <span className="text-xs text-gray-600">
                                      {item.appleId}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    <div className="border-b md:col-span-2 border-neutral-100 my-1"></div>

                    {/* Song Writers */}
                    <div className="space-y-1">
                      <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                        Song Writers
                      </p>
                      <p className="text-gray-900 text-base md:text-lg font-medium break-words">
                        {releaseDetails.songWriter
                          ?.map((item) => item.first_name)
                          .join(", ") || "N/A"}
                      </p>
                    </div>

                    {/* Producers */}
                    <div className="space-y-1">
                      <p className="text-text-disable font-bold text-xs uppercase tracking-wider">
                        Producers
                      </p>
                      <p className="text-gray-900 text-base md:text-lg font-medium break-words">
                        {releaseDetails.producer
                          ?.map((item) => item.name)
                          .join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
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
