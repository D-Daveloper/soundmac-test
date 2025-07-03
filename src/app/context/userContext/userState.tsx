'use client'

import { useContext, useEffect, useState } from "react";
import UserContext from "./userContext";
import { USER } from "./types";
import InformationContext from '@/app/context/informationContext/informationContext';
import { usePathname, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ERROR_PROPS, GET_USER, ON_SUCCESS } from "@/app/type";
import { linkRoutes } from "@/app/utils/constants";
import { SERVER } from "@/app/constant";

const UserState = ({ children }: { children: React.ReactNode }) => {
    const redirect = usePathname()
    const router = useRouter()
    const informationContext = useContext(InformationContext)
    const [user, setUser] = useState<USER | null>(null);
    const [hamburgerOpen, setHamburgerOpen] = useState(false)
    const [token, setToken] = useState<string | null>(null)

    // token
    useEffect(() => {
        setToken(localStorage.getItem("token"))
    }, [user])

    const logOut = () => {
        localStorage.removeItem('token')
        setUser(null);
        router.push(linkRoutes?.SignIn);
        setHamburgerOpen(false)
    }

    const handleAPIError = (err: unknown) => {
        const error = err as AxiosError<ERROR_PROPS>;
        const message = error?.response?.data?.message || error?.response?.data?.msg || "unexpected error";
        const upgrade = error.response?.data?.data?.upgrade

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                logOut()
                router.push(`${linkRoutes?.SignIn}?redirect=${redirect}`);
            }

            if (!!upgrade?.length) {
                console.log('subscribe');
                informationContext?.encourageUpgrade(upgrade)
            } else {
                informationContext?.addToast('error', 'Error!', message)
            }

        } else {
            console.error("Unexpected error:", error);
        }

    }


    const getUser = async (setLoading: GET_USER, onSuccess: ON_SUCCESS, onError = handleAPIError) => {
        const token = localStorage.getItem("token")
        const config = { headers: { Authorization: `Bearer ${token}`, }, };
        setLoading(true)
        try {
            const res = await axios.get(`${SERVER}/users/user`, config);
            const data = res.data;
            setUser(data.user);
            onSuccess(data.user)
        } catch (error) {
            onError(error)
        } finally {
            setLoading(false)
        }
    };


    return (
        <UserContext.Provider
            value={{
                user, setUser, getUser, hamburgerOpen, logOut, handleAPIError, token
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserState;
