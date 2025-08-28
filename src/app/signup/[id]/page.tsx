"use client";
import { useContext, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { NormalLoadingScreen } from "@/app/components/Loader/loader";
import { useParams, useRouter } from "next/navigation";
import InformationContext from "@/app/context/informationContext/informationContext";
import { ERROR_PROPS } from "@/app/type";

const Verify = () => {
  const informationContext = useContext(InformationContext);
  const router = useRouter();
  const { id } = useParams();
  
  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await axios.get("/api/auth/register/" + id);
        console.log("Verification response:", response);
        informationContext?.addToast("success", "Success!", response.data.msg);
        router.push("/signIn");
      } catch (err) {
        const error = err as AxiosError<ERROR_PROPS>;
        const message = error?.response?.data?.msg || "unexpected error";
        informationContext?.addToast("error", "Error!", message);
        console.error("Verification failed:", error);
        router.push("/signup");
      }
    };

    if (id) {
      verifyAccount();
    }
  }, [id]);

  return (
    <div className="min-h-[100dvh] flex justify-center items-center">
      <NormalLoadingScreen />
    </div>
  );
};

export default Verify;
