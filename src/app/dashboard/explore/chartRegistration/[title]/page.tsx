'use client';
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { chartRegistrationConstants } from "@/app/constant";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useGetUserArtistsNames,
  useGetUserReleaseNames,
} from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = ({ params }: { params: Promise<{ title: string }> }) => {
  const { title } = use(params);
  const api = UseAxios();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [ChartRegistrationForm, setChartRegistrationForm] = React.useState({
    artist: "",
    releaseTitle: "",
  });
  if (!title || !chartRegistrationConstants.some((chart) => chart.slug === title)) {
    return <InlineLoadingScreen />;
  }
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
    { artist: ChartRegistrationForm.artist },
    {
      enabled: !!ChartRegistrationForm.artist, // ✅ only run if artist exists
    },
  );
  
  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      console.log(ChartRegistrationForm);

      if (!ChartRegistrationForm.artist) {
        toast.warn("Artist is required.");
        return;
      } else if (!ChartRegistrationForm.releaseTitle) {
        toast.warn("Release Title is required.");
        return;
      }

      const formData = new FormData();
      Object.entries(ChartRegistrationForm).forEach(([key, value]) => {
        if (value != null) formData.append(key, value);
      });

      formData.append("chartSlug", title);
      let res;
      res = await api.post("explore/chart-registration", formData, {
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
  useEffect(() => {
    if (data && data?.length > 0 && !ChartRegistrationForm.artist) {
      setChartRegistrationForm((prev) => ({
        ...prev,
        artist: data[0],
      }));
    }
  }, [data]);

  return (
    <>
    <div className="lg:pl-[300px] bg-main-white h-screen w-full flex flex-col px-10">
        {/* back button */}
        {isLoading ||
        releaseNamesIsLoading ||
        isSubmittingForm ||
        releaseNamesIsFetching ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className="lg:mx-5">

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
                        selected={ChartRegistrationForm.artist}
                        setSelected={(t) =>
                          setChartRegistrationForm((prev) => ({ ...prev, artist: t }))
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
                        selected={ChartRegistrationForm.releaseTitle}
                        setSelected={(t) =>
                          setChartRegistrationForm((prev) => ({
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
              </div>
              {/* total */}
              <div className="w-full border-2 border-main-icon-color p-1 rounded-2xl mb-60 lg:max-w-[60%]">
                <div className="bg-neutral-50 border-2 border-neutral-100 flex flex-col p-5 rounded-2xl items-center w-full capitalize gap-5">
                  <p className="text-body-two-regular font-semibold text-text-disable">
                    Total Amount Due
                  </p>
                  <p className="text-h5-semibold">
                    ${25}
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

export default Page;
