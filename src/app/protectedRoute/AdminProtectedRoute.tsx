"use client";
import { useRouter } from "next/navigation";
import { NormalLoadingScreen } from "../components/Loader/loader";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function AdminRoute({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: user, isLoading, isError, error } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (isError) {
      if (isAxiosError(error)) {
        if (error.status === 401) {
          router.replace("/login");
        } else {
          router.back();
        }
      } else {
        toast.error(error?.message);
        router.back();
      }
    }

    if (user && user.role !== "admin" && user.role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [user, isError, error, router]);

  if (isLoading) {
    return <NormalLoadingScreen />;
  }

  if (user?.role != "admin" && user?.role !== "super_admin") {
    return <NormalLoadingScreen />;
  }

  return <>{children}</>;
}
