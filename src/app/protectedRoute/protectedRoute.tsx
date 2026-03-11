/* eslint-disable react-hooks/exhaustive-deps */
'use client'
// import { useContext, useEffect, useState } from "react"
// import UserContext from "../context/userContext/userContext";
// import { USER } from "../context/userContext/types";
// import { linkRoutes } from "../utils/constants";
import { useRouter } from "next/navigation";
import { NormalLoadingScreen } from "../components/Loader/loader";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function UserRoute({
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

    if (user && user.role !== "user") {
      router.replace("/dashboardAdmin");
    }
  }, [user, isError, error, router]);

  if (isLoading) {
    return <NormalLoadingScreen />;
  }

  if (user?.role != "user") {
    return <NormalLoadingScreen />;
  }

  return <>{children}</>;
}
// export default function UserRoute({ children }: Readonly<{ children: React.ReactNode; }>) {
//     const userContext = useContext(UserContext)
//     const router = useRouter()
//     const [gettingUser, setGettingUser] = useState(false)
//     const [shouldRedirect, setShouldRedirect] = useState(false)

//     const user = userContext?.user

//     const onSuccess = (user: USER) => {
//         const userRole: string = user?.role;
//         const location = linkRoutes.artists[userRole]
//         router.push(location)
//     }

//     const onError = (error: unknown) => {
//         userContext?.handleAPIError(error)
//     }

//     useEffect(() => {
//         if (!user) {
//             userContext?.getUser(setGettingUser, onSuccess, onError)
//         }
//     }, [user]);

//     useEffect(() => {
//         if (user && user?.role !== 'user') {
//             setShouldRedirect(true)
//         }
//     }, [user]);

//     useEffect(() => {
//         if (shouldRedirect) {
//             router.push('/')
//         }
//     }, [shouldRedirect, router]);

//     if (gettingUser || !user) {
//         return <NormalLoadingScreen />
//     }

//     return children

// }