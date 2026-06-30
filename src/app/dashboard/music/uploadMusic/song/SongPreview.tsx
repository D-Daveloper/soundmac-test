"use client";
import Image from "next/image";
import type { SongForm } from "@/app/type";

interface SongPreviewProps {
  songForm: SongForm;
  image: string | null;
  onEdit: () => void;
}

const SongPreview: React.FC<SongPreviewProps> = ({
  songForm,
  image,
  onEdit,
}) => {
  // const router = useRouter()
  // const dashboardContext = useContext(DashboardContext);

  // useEffect(() => {
  //     if (preview) {
  //         dashboardContext?.setHeader({
  //             title: "preview",
  //             showBackButton: true,
  //             onBack: () => router.back(), // pops ?step=preview → back to form
  //         });
  //     } else {
  //         dashboardContext?.setHeader({
  //             title: "upload single",
  //             showBackButton: true,
  //             onBack: () => router.push("/dashboard/music/uploadMusic?type=single"),
  //         });
  //     }
  // }, [preview]); // ← re-runs when preview changes
  //  useEffect(() => {
  //     dashboardContext?.setHeader({
  //       title: "preview",
  //       showBackButton: true,
  //       onBack: () => router.push("/dashboard/music/uploadMusic?type=single")
  //     });
  //   }, []);

  return (
    <div className="flex-3 overflow-y-auto flex flex-col gap-10 lg:h-[68dvh] pb-20 lg:pb-5 custom-scrollbar">
      <div>
        <div className="flex items-center justify-between border-neutral-100 border-b md:border-none pb-2">
          <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading  border-neutral-100">
            Song Summary
          </h1>
          <button
            onClick={onEdit}
            className="text-sm font-semibold text-primary hover:underline transition-all mr-2"
          >
            Edit Details
          </button>
        </div>
        {/* image */}
        <div className="w-full flex flex-col space-y-3 mt-3">
          <p className="font-bold text-[#000000] text-sm leading-[18px] tracking-[0.5px]">
            Artwork File
          </p>
          <div className="w-64 md:w-80 h-24 flex gap-4 items-center p-4 rounded-2xl border border-neutral-200 bg-white">
            {image ? (
              <>
                <div className="w-20 h-20 relative shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <Image
                    src={image}
                    fill
                    alt="music note icon"
                    className="object-fit"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-body font-bold text-sm truncate">
                    {songForm.music_image?.name}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 py-2 px-1">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                  ⚠️
                </div>
                <p className="text-text-disable font-medium text-sm">
                  No image selected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Fields Grid */}
      <div className="text-[#103958] font-bold text-sm leading-[18px] tracking-[0.5px] grid grid-cols-2 gap-x-8 gap-y-6 px-2">
        {/* Song Title */}
        <div className="flex flex-col gap-y- w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Song Title
          </h2>
          <div className="pb-">
            <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.title}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Language
          </h2>
          <div className="pb">
            <p className="truncate text-text-body text-xs font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.language}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Main Artist */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Main Artist
          </h2>
          <div className="pb">
            <p className="truncate text-text-body text-xs font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.artist}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Featured Artists */}
        <div className="flex flex-col">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Featured Artists
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.featured_artist
                .map((item) => item.artistName)
                .join(", ")}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Performers */}
        <div className="flex flex-col gap w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Performers
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.performer.map((item) => item.name).join(", ")}
            </p>
            <div className="border border-neutral-100 "></div>
          </div>
        </div>

        {/* Songwriter */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Songwriter
          </h2>
          <div className="pb">
            <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.song_writer.map((item) => item.first_name).join(", ")}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Producer */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Producer
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.producer.map((item) => item.name).join(", ")}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Territories */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Territories
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.territories.join(", ")}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* UPC */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            UPC
          </h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.upc}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* ISRC */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            ISRC
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal leading-[30px] text-xs tracking-[1px] min-h-[30px]">
              {songForm.isrc}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Release date */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Release date
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal leading-[30px] text-xs tracking-[1px] min-h-[30px]">
              {songForm.release_date?.toLocaleDateString() || ""}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>

        {/* Preorder Start date */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-tight text-[#103958] capitalize">
            Preorder Start date
          </h2>
          <div className="">
            <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.preOrderDate?.toLocaleDateString() || ""}
            </p>
            <div className="border border-neutral-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPreview;
