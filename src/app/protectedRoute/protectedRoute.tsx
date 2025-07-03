/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useContext, useEffect, useState } from "react"
import UserContext from "../context/userContext/userContext";
import { USER } from "../context/userContext/types";
import { useRouter } from "next/navigation";
import { linkRoutes } from "../utils/constants";
import { NormalLoadingScreen } from "../components/Loader/loader";

export default function UserRoute({ children }: Readonly<{ children: React.ReactNode; }>) {
    const userContext = useContext(UserContext)
    const router = useRouter()
    const [gettingUser, setGettingUser] = useState(false)
    const [shouldRedirect, setShouldRedirect] = useState(false)

    const user = userContext?.user

    const onSuccess = (user: USER) => {
        const userRole: string = user?.role;
        const location = linkRoutes.artists[userRole]
        router.push(location)
    }

    const onError = (error: unknown) => {
        userContext?.handleAPIError(error)
    }

    useEffect(() => {
        if (!user) {
            userContext?.getUser(setGettingUser, onSuccess, onError)
        }
    }, [user]);

    useEffect(() => {
        if (user && user?.role !== 'user') {
            setShouldRedirect(true)
        }
    }, [user]);

    useEffect(() => {
        if (shouldRedirect) {
            router.push('/')
        }
    }, [shouldRedirect, router]);

    if (gettingUser || !user) {
        return <NormalLoadingScreen />
    }

    return children

}