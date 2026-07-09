import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from 'next/navigation'
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { getAlbumPerformanceData } from "@/app/api/insights/song-performance/album/[id]/route";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  // Await the params directly on the server
  const { id } = await params;

// 1. Check Auth directly on the Server Component level
  const userData = await verifyJWT();
  const userJwt = verifyUser(userData);
  
  if (userJwt.msg) {
    redirect("/login?redirect=/dashboard/insights/songPerformance/album/"+id);
  }

  // 2. Call your direct database service function (Zero HTTP Request Overhead 🎉)
  const result = await getAlbumPerformanceData(id, userJwt.user as string | null);

  if (result.status === 404 || !result.data) {
    notFound();
  }
  
  if (result.status === 400) {
     throw new Error("Invalid album configuration requested.");
  }

  const songData = result.data; // Has .release and .tracks ready to map!

  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:px-3">
      <Link
        aria-label="go back"
        href="/dashboard/insights/songPerformance/album"
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary text-2xl rounded-full shadow-2xl shadow-black my-2 flex items-center justify-center"
      >
        <Image src="/arrow-left.svg" height={32} width={32} alt="arrow left" />
      </Link>

      <div className="flex gap-20 justify-between max-md:flex-wrap">
        <div className="w-full flex flex-col gap-3">
        {/* Left Side: Song info list item */}
        {songData.tracks.length > 0 &&
          songData.tracks.map((track, index) => (
            <div
              key={index}
              className="flex-2 rounded-3xl bg-neutral-50 border border-neutral-100 text-main-heading font-semibold flex gap-5 p-3 max-h-fit!"
            >
              <p className="text-xl max-h-fit">{track.trackNumber ?? 1}</p>
              <div className="max-h-fit">
                <p className="font-light text-2xl">{track.releaseTitle}</p>
                {track.featuredArtist && (
                  <p className="text-sm line-clamp-1">
                    feat {track.featuredArtist[0].artistName}
                  </p>
                )}
              </div>
              <div className="relative max-w-[20px] max-h-[20px] min-w-[20px] min-h-[20px] w-[20px] h-[20px] ml-auto mt-2">
                <Image
                  priority={false}
                  src="/arrow-right.svg"
                  alt="arrow right icon"
                  fill
                />
              </div>
            </div>
          ))}
            
        </div>

        {/* Right Side: Song Preview Card */}
        {songData.release && (
          <div className="bg-neutral-50 border-2 border-neutral-100 flex-1 rounded-lg p-2 max-w-fit max-h-fit flex flex-col md:mr-10 ">
            <div className="relative max-w-[300px] max-h-[300px] min-w-[300px] min-h-[300px] w-[300px] h-[300px]">
              <Image
                src={songData.release.releaseImage || "/signinimage.png"}
                width={300} // Matches parent dimensions better than 100x100
                height={300}
                alt={`Cover art for ${songData.release.releaseTitle}`}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 mt-3">
              <p className="font-normal leading-[30px] truncate max-w-50 tracking-[-1px] text-main-heading text-2xl">
                {songData.release.releaseTitle}
              </p>
              <p className="font-light leading-[20px] truncate max-w-50 tracking-[-0.5px] text-main-heading text-[16px]">
                {songData.release.artistName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
