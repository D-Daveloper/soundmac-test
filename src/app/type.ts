import { IArtist } from "@/util/models/artistModel";
import { USER } from "./context/userContext/types";

export interface AYNCardProps {
  index: number;
  title: string;
  subTitle: string;
}

export interface ERROR_PROPS {
  msg: string;
  message: string;
  validationErrs: string[];
  data: { upgrade: string[] };
}

export type INDEX_ASSIGNOR = { [key: string]: string };

export interface ROUTE_CONFIG {
  Home: string;
  SignIn: string;
  SignUp: string;
  artists: INDEX_ASSIGNOR;
}

export type GET_USER = React.Dispatch<React.SetStateAction<boolean>>;
export type ON_SUCCESS = (user: USER) => void;
export type ON_ERROR = (error: unknown) => void;

export interface LOCATION_TREE_ASSIGNOR {
  [key: string]: {
    [key: string]: INDEX_ASSIGNOR[];
  };
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
  name: string;
  // last_name: string;
}

interface musicFormBase {
  title: string;
  genre: string;
  language: string;
  artist: string;
  release_date: undefined | Date;
  preOrderDate: undefined | Date;
  territories: string[];
  pre_order_check: boolean;
  another_distribution_check: boolean;
  music_image: File | null;
  upc: string;
  dsp: string[];
  copyRightHolder: string;
  copyRightYear: string;
  old_image?: string | null;
}

export interface SongForm extends musicFormBase {
  featured_artist: FeaturedArtist[];
  performer: Performer[];
  song_writer: SongWriter[];
  producer: Producer[];
  song_audio: File | null;
  lyrics: string;
  start_clip: string;
  isrc: string;
  explicit_content: boolean;
}

export interface AlbumForm extends musicFormBase {
    number_of_track:string;
}

export type CreateArtistForm = {
  artist_name: string;
  apple_id: string;
  spotify_id: string;
  artist_image: File | null ;
  hasPlatformId:boolean
};

export type OtpForm = {
  email: string;
  otp: string;
  type: "login" | "register" | "forgotPassword";
  password?: string;
};

export type Artist = Pick<IArtist, 'artistName' | 'artistImage' | 'appleId' | 'spotifyId' | 'updatedAt' | 'createdAt'>;

export type SELECTED_IMAGE = string | null | ArrayBuffer

// export interface ARTIST {
//     _id: string
//     artistName: string
//     artistImage: string
//     createdAt: Date
//     appleId: string
//     spotifyId: string
// }

export interface PAGINATION<T> {
  data:T[];
    page: number
    skip: number
    sort: string
    limit: number
    hasNextPage: boolean
    totalCount: number,
    totalPages: number
}

export interface ARTIST_TABLE extends Artist {
    lastRoyalty:number;
    totalRoyalty:number;
    totalTracks:number;
    totalReleases:number;

}

export type ArtistStat = {
  artists:string[],
  totalReleases:string
  artist:Artist
}

interface BaseApiResponseForRelease{
  _id: string
  releaseTitle: string
  genre: string
  releaseLanguage: string
  artistName: string
  artist: Artist
  releaseDate: Date
  preOrderDate: Date | null
  preOrderCheck: boolean
  anotherDistributionCheck: boolean
  territories: string[]
  releaseImage: string
  dsp: string[]
  upc: string
  releaseStatus: "pending"|"approved"|"rejected"|"draft"
  copyRightHolder: string
  copyRightYear: string
  createdAt: Date
  updatedAt: Date
  __v: number
}

export interface songFromApi extends BaseApiResponseForRelease
  {
  featuredArtist: FeaturedArtist[]
  performer: Performer[]
  songWriter: SongWriter[]
  producer: Producer[]
  releaseAudio: string
  lyrics: string
  startClip: string
  isrc: string
  explicitContent: boolean

}
export interface albumFromApi extends BaseApiResponseForRelease
  {
  numberOfTracks:string;
  unassignedNumber:string[];

}

export interface NonRetryableErrorCode {
  name?: string;
  Code?: string;
  $metadata?: {
    httpStatusCode: number;
  };
}
// Mock data based on the provided schema for songFromApi
// Assuming Artist is an object with basic properties (since not fully defined in schema, using a simple structure)
