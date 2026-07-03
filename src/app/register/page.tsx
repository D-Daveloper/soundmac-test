"use client";
import React from "react";
import si from "@/../public/signinimage.png";
import Image from "next/image";
import RegisterForm from "./RegisterForm";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useGoogleAuthMutation } from "@/util/customHooks/useMutations";
import { toast } from "react-toastify";

const Page = () => {
  const { mutate: googleAuth, isPending } = useGoogleAuthMutation();
  const router = useRouter();

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse?.credential) {
      googleAuth(credentialResponse.credential);
      // toast.success("")
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    toast.error("Failed to sign in with Google");
  };

  return (
    // <main className="section flex h-[100dvh] sm:overflow-hidden max-xs:min-h-[100dvh]">
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <main className="section flex min-h-screen lg:h-screen overflow-y-hidden">
        {isPending && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3 transition-all">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm font-semibold text-neutral-700 animate-pulse">
              Creating your account..
            </p>
          </div>
        )}
        <div className="w-[40%] max-md:hidden relative">
          <Image
            priority={true}
            src={si}
            width={0}
            height={0}
            alt="just a face with head phones on"
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => router.back()}
            className="absolute w-15 h-10 rounded-lg flex justify-center items-center text-2xl text-white! bg-primary-500 top-0 m-8"
          >
            <ChevronLeft />
          </button>
        </div>
        {/* <div className="flex flex-1 mt-3 flex-col"> */}
        <div className="flex flex-1 pt-0 md:pt-6 flex-col overflow-y-auto">
          <button
            onClick={() => router.back()}
            className="max-w-15 max-h-10 min-w-15 min-h-10 rounded-lg flex justify-center items-center text-2xl text-white! bg-primary-500 m-5 md:hidden"
          >
            <ChevronLeft />
          </button>
          <div className="w-[70%] mx-auto text-center max-sm:w-[90%]">
            <h1 className="text-primary font-extrabold text-2xl leading-10 tracking-[0.5px]">
              {" "}
              Create Your Soundmac Account
            </h1>
            <p className="text-p font-normal text-sm leading-5 tracking-[0.5px] mt-1">
              Join thousands of artists and labels distributing their music
              worldwide.
            </p>
            <div className="border-[1.5px] border-dashed border-[#E1E1CF] my-7"></div>
            <div className="w-[70%] mx-auto max-sm:w-[90%] mt-8">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  containerProps={{
                    style: { width: "100%", maxWidth: "100%" },
                  }}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="circle"
                  logo_alignment="center"
                />
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>
          </div>
          <RegisterForm />
        </div>
      </main>
    </GoogleOAuthProvider>
  );
};

export default Page;
