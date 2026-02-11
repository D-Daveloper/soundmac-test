

export interface DASHBOARD_CONTEXT {
    layoutHeaderMessage: string;
    setLayoutHeaderMessage: React.Dispatch<React.SetStateAction<string>>
    // getUser: (setLoading: GET_USER, onSuccess: ON_SUCCESS, onError: ON_ERROR) => void
    // hamburgerOpen: boolean
    // logOut: () => void
    // handleAPIError: (err: unknown) => void
    // token: string | null
}

// export interface USER {
//     first_name: string,
//     last_name: string,
//     role: string,
//     type: string
// }