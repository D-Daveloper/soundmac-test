import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import {
  useGetAdminUserDetails,
} from "@/util/customHooks/useQueries";
import { formatAmount } from "@/util/middleware/functions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const UserInfo = ({ userId }: { userId: string }) => {
  if (!userId) {
    return <InlineLoadingScreen />;
  }
  const {
    isLoading: isLoadinguserDetails,
    data: userDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetAdminUserDetails({ userId });
  return (
    <div className="w-full my-10">
      {isLoadinguserDetails || !userDetails ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="bg-warning-50 flex justify-between w-full gap-2 p-5 rounded-2xl max-h-35">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative w-20 h-20 max-w-20 max-h-20">
                  <Image
                    priority={true}
                    src={userDetails.data.profilePic || "/signinimage.png"}
                    alt="release Image"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="font-bold leading-[30px] tracking-[-1px] text-2xl text-primary-500">
                    {userDetails.data.firstName} {userDetails.data.lastName}
                  </h1>
                  <p className="font-normal leading-[24px] tracking-[-0.5px] text-xl text-primary-500">
                    {userDetails.data.email}
                  </p>
                  <p className="font-semibold leading-[18px] tracking-[-0.5px] text-sm text-text-body">
                    {new Date(userDetails.data.createdAt).toDateString()}
                  </p>
                </div>
              </div>
              <p className="font-bold leading-[18px] tracking-[-0.5px] text-sm text-text-disable">
                Last Login: {new Date(userDetails.data.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <span className="h-fit p-3 rounded-full text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
              {userDetails.label}
            </span>
          </div>
          <div>
            <div className="flex gap-15 mt-10">
              <div className="flex flex-col w-[30%] max-sm:w-full">
                <Input
                  value={userDetails.data.country}
                  title={"Country"}
                  type={"text"}
                  name={"artist"}
                  placeholder={"Enter Artist Name"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col w-[30%] max-sm:w-full">
                <Input
                  value={userDetails.data.referral_code || "No code"}
                  title={"Referral Code"}
                  type={"text"}
                  name={"artist"}
                  placeholder={"Enter Artist Name"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
            </div>
            <div className="flex gap-10 mt-5">
              <div
                className={
                  " bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25] " +
                  (isRefetching && " shimmer")
                }
              >
                <div
                  className={
                    "capitalize flex flex-col gap-3 p-3 h-full justify-center " +
                    (isRefetching && " hidden")
                  }
                >
                  <div className="flex justify-between flex-1">
                    <Image
                      src={"/musicnote.svg"}
                      priority={false}
                      height={50}
                      width={53}
                      alt="music note icon"
                      className="w-auto h-auto"
                    />
                    <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end truncate">
                      {userDetails.songCount}
                    </h2>
                  </div>
                  <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                    released songs
                  </p>
                </div>
              </div>
              <div
                className={
                  " bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full " +
                  (false && " shimmer")
                }
              >
                <div
                  className={
                    "capitalize flex justify-between p-3 h-full " +
                    (false && " hidden")
                  }
                >
                  <Image
                    src={"/musicnote.svg"}
                    priority={false}
                    height={50}
                    width={53}
                    alt="music note icon"
                    className="self-start w-auto h-auto"
                  />
                  <div className="mt4 self-end">
                    <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg">
                      Total Earnings
                    </p>
                    <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                      {formatAmount(userDetails.totalEarnings)}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex gap-15 mt-10">
              <div className="flex flex-col w-[30%] max-sm:w-full">
                <Input
                  value={userDetails.data.label}
                  title={"Label name"}
                  type={"text"}
                  name={"label"}
                  placeholder={"Enter Label Name"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p>{userDetails.artists.length} Artists</p>
              <div className="bg-neutral-50 border border-neutral-100 rounded-lg h-[300px] overflow-y-scroll">
                {userDetails.artists.map((item, index) => (
                  <Link
                    href={"/dashboardAdmin/artist/all-artists/"+item._id+"?tab=artist-info"}
                    key={index}
                    className="flex gap-3 border-b border-neutral-100 p-3 items-center"
                  >
                    <div className="relative w-8 h-8 max-w-8 max-h-8">
                      <Image
                        priority={true}
                        src={item.artistImage || "/signinimage.png"}
                        alt="release Image"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <p>{item.artistName}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserInfo;
