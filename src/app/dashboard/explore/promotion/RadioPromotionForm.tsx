import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import {
  boomplayPackages,
  promotionCategory,
  radioPromotionPackages,
} from "@/app/constant";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useGetUserArtistsNames,
  useGetUserReleaseNames,
} from "@/util/customHooks/useQueries";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { isAxiosError } from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
const RadioPromotionForm = () => {
  const { deleteParam } = useTabQuery();
  const api = UseAxios();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [promotionForm, setPromotionForm] = React.useState({
    artist: "",
    releaseTitle: "",
    releaseDescription: "",
    promotionPackage: "",
    promotionType: promotionCategory.radioPromotion,
  });
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetUserArtistsNames();

  const {
    isLoading: releaseNamesIsLoading,
    data: releaseNamesData,
    isFetching: releaseNamesIsFetching,
    isPending: releaseNamesIsPending,
    isRefetching: releaseNamesIsRefetching,
    isError: releaseNamesIsError,
    refetch: releaseNamesRefetch,
  } = useGetUserReleaseNames(
    { artist: promotionForm.artist },
    {
      enabled: !!promotionForm.artist, // ✅ only run if artist exists
    },
  );

  // useEffect(() => {
  //   if (data && data?.length > 0 && !promotionForm.artist) {
  //     setPromotionForm((prev) => ({
  //       ...prev,
  //       artist: data[0],
  //     }));
  //   }
  // }, [data]);

  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      console.log(promotionForm);
      if (!promotionForm.artist) {
        toast.warn("Artist is required.");
        return;
      } else if (!promotionForm.releaseTitle) {
        toast.warn("Release Title is required.");
        return;
      } else if (!promotionForm.releaseDescription) {
        toast.warn("Release Description is required.");
        return;
      } else if (!promotionForm.promotionPackage) {
        toast.warn("Please select a package.");
        return;
      } else if (!promotionForm.promotionType) {
        toast.warn("Please select a package type.");
        return;
      }
      const formData = new FormData();
      Object.entries(promotionForm).forEach(([key, value]) => {
        if (value != null) formData.append(key, value);
      });
      let res;
      res = await api.post("promotions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.msg);
      window.location.href = res.data.url;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <>
      <div className="bg-main-white max-sm:min-h-auto min-h-[90.5dvh] h-full w-full flex flex-col ">
        {/* back button */}
        {isLoading || releaseNamesIsLoading || isSubmittingForm ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className="max-w-[1200px]">
              <div className="flex items-center mt-5">
                <button
                  aria-label="go back"
                  onClick={() => {
                    deleteParam("promotionType");
                  }}
                >
                  <Image
                    src={"/arrow-left.svg"}
                    height={28}
                    width={20}
                    alt="arrow left"
                  />
                </button>
                <p className="text-text-body text-body-two-regular px-5">
                  Select the track you want to promote
                </p>
              </div>
              {/* form */}
              <div className="mt-10 flex flex-col gap-5 mb-10">
                <div className="w-full flex flex-wrap justify-between gap-y-10">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 sm:text-sm text-lg flex gap-2">
                      Artist
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3"
                      />
                    </p>
                    <div className="w-full">
                      <Select
                        selected={promotionForm.artist}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({ ...prev, artist: t }))
                        }
                        placeholder="Select Artist..."
                        options={data || []}
                        name="artist"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 sm:text-sm text-lg flex gap-2">
                      Release
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3"
                      />
                    </p>
                    <div className="w-full">
                      <Select
                        selected={promotionForm.releaseTitle}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            releaseTitle: t,
                          }))
                        }
                        placeholder="Select Release..."
                        options={releaseNamesData || []}
                        name="releaseTitle"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1 sm:text-sm text-lg">
                    <p className=" capitalize font-medium flex gap-2">
                      Music Description{" "}
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3"
                      />
                    </p>
                  </div>

                  <textarea
                    value={promotionForm.releaseDescription}
                    onChange={(e) =>
                      setPromotionForm((prev) => ({
                        ...prev,
                        releaseDescription: e.target.value,
                      }))
                    }
                    className="w-full sm:w-[70%] min-h-80 border-2 rounded-2xl p-4 mt-1"
                    placeholder="Music Description..."
                  ></textarea>
                </div>
                <div className="w-full flex flex-wrap justify-between gap-y-10">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 sm:text-sm text-lg flex gap-2">
                      Package
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3"
                      />
                    </p>
                    <div className="w-full">
                      <Select
                        selected={promotionForm.promotionPackage}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            promotionPackage: t,
                          }))
                        }
                        placeholder="Select Package..."
                        options={radioPromotionPackages}
                        name="promotionPackage"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* total */}
              <div className="w-full border-2 border-main-icon-color p-1 rounded-2xl mb-60">
                <div className="bg-neutral-50 border-2 border-neutral-100 flex flex-col p-5 rounded-2xl items-center w-full capitalize gap-5">
                  <p className="text-body-two-regular font-semibold text-text-disable">
                    Total Amount Due
                  </p>
                  <p className="text-h5-semibold">
                    {promotionForm.promotionPackage?.split("|")[1]}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex py-3 w-full h-fit bg-secondary-50 self-end justify-end mt-auto border-1 border-neutral-100 fixed bottom-0">
              <button
                onClick={() => {
                  // setIsExplorePage(true);
                  handleSubmit();
                }}
                type="button"
                className={
                  "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white"
                }
              >
                Confirm Request
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RadioPromotionForm;
