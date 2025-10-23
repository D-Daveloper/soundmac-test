"use client";
import { useEffect } from "react";
import { NormalLoadingScreen } from "@/app/components/Loader/loader";
import { useParams, useRouter } from "next/navigation";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";

const Verify = () => {
  const api = UseAxios();
  const router = useRouter();
  const { id } = useParams();
  
  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await api.get("auth/register/" + id);
        console.log("Verification response:", response);
        router.push("/login");
        toast.success(response.data.msg);
      } catch (err) {
        console.error("Verification failed:", err);
        router.push("/register");
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
