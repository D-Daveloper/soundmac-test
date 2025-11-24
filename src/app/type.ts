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
export interface FeaturedArtist {
  artistName: string;
  spotifyId: string;
  appleId: string;
}
export interface SongWriter {
  first_name: string;
  last_name: string;
}
export interface Performer {
  name: string;
  role: string;
}
export interface Producer {
  first_name: string;
  last_name: string;
}

interface musicFormBase{
  title:string;
  genre:string;
  language: string;
  artist: string;
  release_date: undefined | Date;
  preOrderDate:undefined|Date;
  territories: string[];
  pre_order_check: boolean;
  another_distribution_check: boolean;
  music_image: File | null;
  upc:string;
  dsp:string[];
  copyRightHolder:string;
  copyRightYear:string;

}
export interface SongForm extends musicFormBase {
  featured_artist: FeaturedArtist[];
  performer: Performer[];
  song_writer: SongWriter[];
  producer: Producer[];
  song_audio: File | null;
  lyrics:string;
  start_clip:string;
  isrc:string;
  explicit_content: boolean;
}

export interface AlbumForm extends musicFormBase{

}

export type OtpForm = {
  email:string;
  otp:string;
  type: "login" | "register" | "forgotPassword";
  password?:string;
}