"use client";
import React from "react";
import si from "@/../public/signinimage.png";
import Image from "next/image";
import LoginForm from "./LoginForm";
import { useRouter } from "next/navigation";
import { Apple, ChevronLeft, Loader2} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import AppleSignIn from "react-apple-signin-auth";
import {
  useGoogleAuthMutation,
  useAppleAuthMutation,
} from "@/util/customHooks/useMutations";
import { toast } from "react-toastify";
import { useGoogleScriptLoaded } from "../components/skeleton/GoogleScript";
import GoogleButtonSkeleton from "../components/skeleton/GoogleSkeleton";

const Page = () => {
  const { mutate: googleAuth, isPending: googlePending } =
    useGoogleAuthMutation();
  const { mutate: appleAuth, isPending: applePending } = useAppleAuthMutation();
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

  const handleAppleSuccess = async (response: any) => {
    try {
      const identityToken = response?.authorization?.id_token;

      if (!identityToken) {
        toast.error("Apple did not return an identity token.");
        return;
      }

      appleAuth({
        identityToken,
        referralCode: "",
        user: response.user,
      });
    } catch (error) {
      console.error("Apple login failed:", error);
      toast.error("Failed to sign in with Apple");
    }
  };

  const handleAppleError = (error: any) => {
    console.error("Apple login failed:", error);
    toast.error("Failed to sign in with Apple");
  };

  const isGoogleLoaded = useGoogleScriptLoaded();

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <main className="section flex h-[100dvh] sm:overflow-hidden max-xs:min-h-[100d">
        {googlePending && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3 transition-all">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm font-semibold text-neutral-700 animate-pulse">
              Securing your session...
            </p>
          </div>
        )}

        {applePending && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3 transition-all">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm font-semibold text-neutral-700 animate-pulse">
              Securing your session...
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
        <div className="flex flex-1 mt-3 flex-col">
          <button
            onClick={() => router.back()}
            className="max-w-15 max-h-10 min-w-15 min-h-10 rounded-lg flex justify-center items-center text-2xl text-white! bg-primary-500 m-5 md:hidden"
          >
            <ChevronLeft />
          </button>

          <div className="w-[70%] mx-auto text-center max-sm:w-[90%] pt-0 md:pt-5">
            <h1 className="text-primary font-extrabold text-2xl leading-10 tracking-[0.5px]">
              Log into Your Soundmac Account
            </h1>
            <p className="text-p font-normal text-sm leading-5 tracking-[0.5px] mt-3">
              Welcome back creator!
            </p>
            <div className="border-[1.5px] border-dashed border-[#E1E1CF] my-7"></div>
            {/* Google OAuth Section */}
            <div className="w-[90%] mx-auto max-sm:w-[90%] mt-8">
              <div className="flex flex-col lg:flex-row  justify-center gap-3">
                {isGoogleLoaded ? (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    containerProps={{
                      style: { width: "100%", maxWidth: "100%" },
                    }}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="circle"
                    logo_alignment="center"
                  />
                ) : (
                  <GoogleButtonSkeleton />
                )}

                <AppleSignIn
                  authOptions={{
                    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
                    scope: "email name",
                    redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI!, // must match an entry in your Apple config
                    state: "signin",
                    nonce: "soundmac-nonce", // ideally generate a fresh one per request
                    usePopup: true, // avoids a full redirect flow
                  }}
                  uiType="light"
                  className="w-full"
                  noDefaultStyle={false}
                  onSuccess={handleAppleSuccess}
                  onError={handleAppleError}
                  skipScript={false}
                  render={(props: any) => (
                    <button
                      {...props}
                      className="flex items-center justify-center gap-2 w-full h-10 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Apple size={15} color="#000000" className="text-black" />
                      Sign in with Apple
                    </button>
                  )}
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

            {/* {isPending && <p className="text-center text-sm mt-3">Signing in with Google...</p>} */}
          </div>
          <LoginForm />
        </div>
      </main>
    </GoogleOAuthProvider>
  );
};

export default Page;
