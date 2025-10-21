import { USER } from "./context/userContext/types";

export interface AYNCardProps {
    index: number,
    title: string,
    subTitle: string
}

export interface ERROR_PROPS { msg: string, message: string,validationErrs:string[], data: { upgrade: string[] } }

export type INDEX_ASSIGNOR = { [key: string]: string };

export interface ROUTE_CONFIG {
    Home: string;
    SignIn: string;
    SignUp: string;
    artists: INDEX_ASSIGNOR;
}

export type GET_USER = React.Dispatch<React.SetStateAction<boolean>>
export type ON_SUCCESS = (user: USER) => void
export type ON_ERROR = (error: unknown) => void

export interface LOCATION_TREE_ASSIGNOR {
    [key: string]: {
        [key: string]: INDEX_ASSIGNOR[]
    }
}

export interface BLOG_CONTENT {
    id: number;
    title: string;
    content: string;
    slug: string;
}