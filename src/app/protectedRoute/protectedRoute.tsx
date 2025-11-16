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

export default function UserRoute({ children }: Readonly<{ children: React.ReactNode; }>) {
   const { data: user, isLoading, isError, error } = useAuthUser();
  const router = useRouter();

  if (isLoading) {
      return <NormalLoadingScreen />
  }
  if (isError) {
    if (isAxiosError(error)) {
      if (error.status === 401) {
        return;
      } else {
        router.back();
        return;
      }
    } else {
      toast.error(error?.message);
      router.back();
      return;
    }
  }


  
  return( <>{children}</>)
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