import { IArtist } from "@/util/models/artistModel";
import { USER } from "./context/userContext/types";
import { nextReleases } from "./utils/constants";
import { IUser } from "@/util/models/userModel";
import { ISupportRequest } from "@/util/models/supportRequestsModel";
import { ILabel } from "@/util/models/labelModel";

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
  dsp: { label: string; value: number }[];
  copyRightHolder: string;
  copyRightYear: string;
  old_image?: string | null;
  timeZone: {
    label: string;
    value: string;
    name: string;
  };
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
  old_audio?: string | null;
  cover_song: boolean;
  license: File | null;
  old_license?: string | null;
}

export interface AlbumForm extends musicFormBase {
  number_of_track: string;
}

export type CreateArtistForm = {
  artist_name: string;
  apple_id: string;
  spotify_id: string;
  artist_image: File | null;
  hasPlatformId: boolean;
};

export type OtpForm = {
  email: string;
  otp: string;
  type: "login" | "register" | "forgotPassword";
  password?: string;
};

export type Artist = Pick<
  IArtist,
  | "artistName"
  | "artistImage"
  | "appleId"
  | "spotifyId"
  | "updatedAt"
  | "createdAt"
  | "_id"
>;

export type SELECTED_IMAGE = string | null | ArrayBuffer;

export interface PAGINATION<T> {
  data: T[];
  page: number;
  skip: number;
  sort: string;
  limit: number;
  hasNextPage: boolean;
  totalCount: number;
  totalPages: number;
  totalBoomplay: number;
  totalPromotions: number;
  totalActivePromotions: number;
  totalPromotionsAmount: number;
  totalOnlinePress: number;
  totalRadioPromotion: number;
  msg: string;
  totalRevenue: string;
}

export interface ARTIST_TABLE extends Artist {
  lastRoyalty: number;
  totalRoyalty: number;
  totalTracks: number;
  totalReleases: number;
}

export type ArtistStat = {
  artists: string[];
  totalReleases: string;
  artist: Artist;
};

interface BaseApiResponseForRelease {
  _id: string;
  releaseTitle: string;
  genre: string;
  releaseLanguage: string;
  artistName: string;
  artist: Artist;
  releaseDate: Date;
  preOrderDate: Date | null;
  preOrderCheck: boolean;
  anotherDistributionCheck: boolean;
  territories: string[];
  releaseImage: string;
  dsp: { label: string; value: number }[];
  upc: string;
  copyRightHolder: string;
  copyRightYear: string;
  createdAt: Date;
  updatedAt: Date;
  catalogNumber: string;
  user: {
    label: string;
  };
  timeZone: {
    label: string;
    value: string;
    name: string;
  };
}

export interface songFromApi extends BaseApiResponseForRelease {
  featuredArtist: FeaturedArtist[];
  performer: Performer[];
  songWriter: SongWriter[];
  producer: Producer[];
  releaseAudio: string;
  lyrics: string;
  startClip: string;
  isrc: string;
  explicitContent: boolean;
  releaseStatus: "pending" | "approved" | "rejected" | "draft";
  isCoverSong: boolean;
  license: string;
}
export interface albumFromApi extends BaseApiResponseForRelease {
  numberOfTracks: string;
  unassignedNumbers: string[];
  releaseStatus: "pending" | "completed" | "approved" | "rejected" | "draft";
}

export interface NonRetryableErrorCode {
  name?: string;
  Code?: string;
  $metadata?: {
    httpStatusCode: number;
  };
}

export interface TrackForm extends SongForm {
  id: string; // frontend-only (uuid)
  track_number: string;
  validationError: string | null;
  uploadStatus?: "idle" | "uploading" | "done" | "error";
  s3key: string;
}
export interface TrackFromApi extends songFromApi {
  trackNumber: string;
  validationError: string | null;
  uploadStatus?: "idle" | "uploading" | "done" | "error";
}

export interface PaymentEmailData {
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: string;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  transactionId: string;
  support_email: string;
  company_name: string;
  company_address: string;
  dashboardUrl: string;
  reactivateUrl?: string;
}

export interface CancellationEmailData {
  customerName: string;
  customerEmail: string;
  planName: string;
  cancellationDate: string;
  accessUntilDate: string;
  dataRetentionDays: string;
  reactivateUrl: string;
  feedbackUrl: string;
}

export interface PayStackBankListResponse {
  status: boolean;
  message: string;
  data: BankObject[];
}

export interface BankObject {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: any;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}
export type withdrawals = {
  _id: string;
  amount: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    accountDetails: {
      accountHolderName?: string | null | undefined;
      accountNumber?: string | null | undefined;
      bankName?: string | null | undefined;
      bankCode?: string | null | undefined;
      currency?: string | null | undefined;
      verified?: boolean | null | undefined;
    };
  };
  withdrawalStatus: "pending" | "approved" | "rejected";
  accountNumber: string;
  createdAt: Date;
  updatedAt: string;
};
export type WithdrawalResponse = {
  data: withdrawals[];
  nextCursor?: string;
  hasMore: boolean;
};

export type adminDashboardType = {
  totalRelease: number;
  totalApprovedReleases: number;
  totalRejectedReleases: number;
  totalPendingReleases: number;
  totalUsers: number;
  totalArtists: number;
  totalSupportRequests: number;
  totalEarnings: number;
  upcomingReleases: typeof nextReleases;
};
export type featuredArtistType = {
  artistName: string;
  spotifyId: string;
  appleId: string;
};
export type songWriterType = {
  first_name: string;
  last_name: string;
};

export type producerType = {
  name: string;
};

export interface AdminRelease {
  _id: string;
  releaseTitle: string;
  artistName: string;
  catalogNumber: string;
  isrc: string;
  upc: string;
  releaseDate: string;
  releaseStatus: "pending" | "completed" | "approved" | "draft" | "rejected";
  releaseImage?: string;
  genre: string;
  featuredArtist: featuredArtistType[];
  songWriter: songWriterType[];
  producer: producerType[];
  artist: {
    appleId: string;
    spotifyId: string;
  };
}
export interface admingAllReleaseResponse {
  releases: AdminRelease[];
  page: number;
  msg: string;
  totalCount: number;
  totalPages: number;
}

export interface rejectEmailProps {
  artistName: string;
  releaseTitle: string;
  rejectionReason?: string;
  supportEmail: string;
  dashboardUrl: string;
}

export interface AdminAlbumDetails {
  _id: string;
  releaseTitle: string;
  releaseStatus: string;
  releaseImage: string;
  artistName: string;
  genre: string;
  releaseDate: string;
  upc: string;
  catalogNumber: string;
  artist: {
    spotifyId: string;
    appleId: string;
  };
}
export interface AdminTrackDetails {
  _id: string;
  releaseTitle: string;
  releaseAudio: string;
  releaseStatus: string;
  artistName: string;
  genre: string;
  releaseDate: string;
  upc: string;
  isrc: string;
  featuredArtist: featuredArtistType[];
  songWriter: songWriterType[];
  producer: producerType[];
  catalogNumber: string;
  explicitContent: boolean;
  trackNumber: number;
}
export interface AdminAlbumDetailsResponse {
  release: AdminAlbumDetails;
  tracks: AdminTrackDetails[];
  msg: string;
}
export interface AdminSingleDetailsResponse {
  release: songFromApi;
  msg: string;
}
type ReleaseRequest = {
  _id: string;
  releaseTitle: string;
  releaseImage: string;
  releaseDate: string;
  numberOfTracks: string;
  artist: {
    artistName: string;
    artistImage: string;
  };
};
export type ReleaseRequestResponse = {
  data: ReleaseRequest[];
  nextCursor?: string;
  hasMore: boolean;
};
type AllArtist = Artist & {
  user: { email: string; firstName: string; lastName: string };
};
export type AllArtistResponse = {
  data: AllArtist[];
  nextCursor?: string;
  hasMore: boolean;
  msg: string;
};

export type ArtistDetails = PAGINATION<AdminRelease> & { artist: Artist };

export type DetactivateEmail = {
  artist_name: string; // "Artist Name"
  first_name: string; // "Artist Name"
  deactivation_type: string; // Dropdown: "Temporary Suspension", etc.
  deactivation_reason: string; // Dropdown: "Copyright Infringement", etc.
  additional_notes: string; // Text area content
  reference_id: string; // Generated reference ID
  deactivation_date: string; // Auto-generated
  data_retention_date: string; // 30 days from now
  appeal_url: string; // Link to appeal form
  support_url: string; // Link to support
  download_data_url: string; // Link to data export
};
export type sendUserNotificationEmailType = {
  user_name: string; // "John Doe"
  user_email?: string; // "john@example.com"
  notification_reason: string; // Dropdown selection
  additional_message: string; // Text area content
  notification_id?: string; // Generated ID for tracking
  notification_date?: string; // Auto-generated
  dashboard_url: string; // Link to user dashboard
  support_url: string; // Link to support
};

export interface AdminUserDetailsResponse {
  data: IUser;
  artists: Artist[];
  songCount: number;
  totalEarnings: number;
  earningsArray: {

    "_id": string,
    "upc": string,
    "trackTitle": string,
    "netAmountUsd": {
      "$numberDecimal": string
    },
    "dsp": string,
    "territory": string,
    label: string
  }[];
  totalCount: number;
  totalPages: number;
  limit: number;
  page: number;
  label: string;
  msg: string;
}

export interface AdminWithdrawalDetailsResponse {
  withdrawal: withdrawals;
  msg: string;
}

export type WithdrawalEmailBody = {
  user_name: string;
  currency: string;
  amount: string;
  transaction_id: string;
  request_date: string;
  update_date: string;
  rejection_reason?: string;
  admin_message?: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  processing_time: string;
};

export type AllSupportRequestsResponse = {
  data: ISupportRequest[];
  nextCursor?: string;
  hasMore: boolean;
  msg: string;
};

export type PromotionEmailBody = {
  artist_name: string;
  content_title: string;
  content_type: string;
  promotion_type: string;
  rejection_reason: string;
  admin_message: string;
  submission_date: string;
  rejection_date: string;
  promotion_id: string;
  resubmit_url: string;
  guidelines_url: string;
  start_date: string;
  end_date: string;
  promotion_url: string;
};

export type CreateLabelForm = {
  label_name: string;
  first_name: string;
  last_name: string;
  instagram_profile_link: string;
  twitter_profile_link: string;
  linkedin_profile_link: string;
  tiktok_profile_link: string;
  label_logo: null | File;
  wants_to_change_name: boolean;
};

type AllLabel = ILabel & { artistCount: number } & {
  user: { email: string; firstName: string; lastName: string };
};

export type AllLabelResponse = {
  data: AllLabel[];
  nextCursor?: string;
  hasMore: boolean;
  msg: string;
};

export type labelResponse = {
  data: ILabel & { artists: Artist[] } & { user: { email: string; firstName: string; lastName: string } };
  nextCursor?: string;
  hasMore: boolean;
};

export type salesReportDashboardResponse = {
  totalWithdrawn: {
    totalWithdrawals: number
  }[],
  totals: {
    totalDocuments: number;
    totalNetAmount: number;
  }[],
  topSongs: {
    totalRevenue: number;
    song: songFromApi;
  }[],
  topArtists: {
    totalRevenue: number;
    artist: Artist;
  }[],
  topLabels: {
    totalRevenue: number;
    label: ILabel
  }[]
}

export type DPMDsp = {
  apiuser_id: number
  id: number
  store_name: string
  store_identifier: any
  dsp: any
  isSelected: boolean
}[]

export type ChartRegistration = {
  _id: string
  user: string
  chartName: string
  artist: Artist;
  releaseTitle: string
  chartStatus: "awaiting_payment"| "pending"| "approved"| "payment_failed"
  createdAt: string
  onModel: string
  updatedAt: string
  transactionId: string
  countryCode: string
  releaseId: {
    _id: string
    releaseTitle: string
    featuredArtist: FeaturedArtist[]
    releaseImage: string
    upc: string
    isrc: string
  }
}