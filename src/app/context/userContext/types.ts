import { GET_USER, ON_ERROR, ON_SUCCESS } from "@/app/type";


export interface USER_CONTEXT {
    user: USER | null;
    setUser: React.Dispatch<React.SetStateAction<USER | null>>
    getUser: (setLoading: GET_USER, onSuccess: ON_SUCCESS, onError: ON_ERROR) => void
    hamburgerOpen: boolean
    logOut: () => void
    handleAPIError: (err: unknown) => void
    token: string | null
}

export interface USER {
    first_name: string,
    last_name: string,
    role: string,
    type: string
}