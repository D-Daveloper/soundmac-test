import mongoose, { InferSchemaType, ObjectId } from "mongoose";
import DpmMetaData from "./DpmCallBackModel";
import { albumFromApi, CheckboxOption, TrackFromApi } from "@/app/type";
import TrackModel from "./trackModel";

export type albumType = InferSchemaType<typeof AlbumSchema>


export const AlbumSchema = new mongoose.Schema(
  {
    releaseTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    genre: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Genre is required",
      ],
      trim: true,
    },
    releaseLanguage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Language is required",
      ],
      trim: true,
    },
    releaseImage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Image is required",
      ],
      trim: true,
    },
    // artistName: {
    //   type: String,
    //   required: [true, "Artist is required"],
    //   trim: true,
    // },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Provide an Artist!"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provide a user!"],
    },
    releaseDate: {
      type: Date,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Release date is required",
      ],
    },
    preOrderDate: {
      type: Date,
      required: [
        function (this: any) {
          return this.get("preOrderCheck") === true;
        },
        "Pre-order date is required",
      ],
    },
    preOrderCheck: {
      type: Boolean,
      required: [true, "Pre-order check is required"],
    },
    anotherDistributionCheck: {
      type: Boolean,
      required: [true, "Another distribution check is required"],
    },
    territories: {
      type: [String],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Territories are required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one territory is required",
      },
    },
    dsp: {
      type: [{ label: String, value: String }],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "DSP (Digital Service Providers) are required",
      ],
      validate: {
        validator: function (this: any, v: CheckboxOption[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0 && v.every((d) => typeof d.label === "string" && typeof d.value === "string");
        },
        message: "At least one DSP is required",
      },
      _id: false
    },
    upc: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "UPC is required",
      ],
      trim: true,
    },
    copyRightHolder: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Copyright holder is required",
      ],
      trim: true,
    },
    copyRightYear: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Copyright year is required",
      ],
      trim: true,
    },
    numberOfTracks: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Add the number of tracks",
      ],
    },
    unassignedNumbers: {
      type: [String],
      required: [true, "Add the array of unassigned numbers"],
    },
    releaseStatus: {
      type: String,
      enum: ["pending", "completed", "approved", "rejected", "draft", "inactive"],
      default: "pending",
    },
    catalogNumber: {
      type: String,
      required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "catalog number is required"],
    },
    timeZone: {
      type: {
        label: String,
        value: String,
        name: String,
      },
      required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Time Zone is required"],
      validate: {
        validator: (v: any) => typeof v === "object" && v !== null && "value" in v && typeof v.value === "string",
        message: "Time Zone must be an object",
      }
    },
    approvedAt: { type: Date, default: null },
    platformDelivery: [
      {
        platform: { type: String, enum: ["spotify", "apple_music"] },
        status: { type: String, enum: ["pending", "live"], default: "pending" },
        lastCheckedAt: Date,
      }
    ],
    description: {
      type: String,
    },
    providedBy: {
      type: String,
      required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Provided by is required"],
      trim: true,
      validate: {
        validator: async function (v: any) {
          // const userType = await mongoose.model("User").findById(this.user).select("type");
          // console.log("userType", userType);
          // if (userType.type.includes("LABEL") === false && v !== "SoundMac") {
          //   return false; // Invalid if user is not a label and providedBy is not "SoundMac"
          // }
          return typeof v === "string" && v.trim().length > 0;
        },
        message: "Provided by is Invalid.",
      }
    },
    courtesyLine: {
      type: String, required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Courtesy line is required"], trim: true,
      validate: {
        validator: async function (v: any) {
          // const userType = await mongoose.model("User").findById(this.user).select("type");
          // console.log("userType", userType);
          // if (userType.type.includes("LABEL") === false && v !== "SoundMac") {
          //   return false; // Invalid if user is not a label and providedBy is not "SoundMac"
          // }
          return typeof v === "string" && v.trim().length > 0;
        },
        message: "Courtesy line is Invalid.",
      }
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// 1. Global Admin Sort / General Feed (Keep only if doing unfiltered global pagination)
AlbumSchema.index({ createdAt: -1 });

// 2. Combined Admin Filter (Covers releaseStatus alone AND releaseStatus + artist)
AlbumSchema.index({ releaseStatus: 1, artist: 1, createdAt: -1 });

// 3. User-Scoped Query & Pagination (Covers user queries + user sorted by createdAt)
AlbumSchema.index({ user: 1, createdAt: -1 });

// 4. Case-Insensitive Title Search (User-Scoped & Global if user prefix isn't mandatory)
AlbumSchema.index(
  { user: 1, releaseTitle: 1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } }
);

// 5. Unique Title Constraint per Artist per User (Added collation for case-insensitivity)
AlbumSchema.index(
  { user: 1, artist: 1, releaseTitle: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
    partialFilterExpression: { releaseStatus: { $ne: "inactive" } }
  }
);

// 6. Identifier Unique Constraints (Standardized with partialFilterExpression)
AlbumSchema.index(
  { catalogNumber: 1 },
  { unique: true, partialFilterExpression: { releaseStatus: { $ne: "inactive" }, catalogNumber: { $exists: true } } }
);

AlbumSchema.index(
  { upc: 1 },
  { unique: true, partialFilterExpression: { releaseStatus: { $ne: "inactive" }, upc: { $exists: true } } }
);

AlbumSchema.statics.approveAndCreateMetadata = async function (songId: ObjectId, artistName, artistSpotifyId, artistAppleId, label: string) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // 1. Update the song status
    const song: albumFromApi = await this.findByIdAndUpdate(
      songId,
      { releaseStatus: 'approved', approvedAt: new Date() },
      { session, new: true } // Crucial: pass the session here
    );

    if (!song) {
      throw new Error('Album not found');
    }

    const tracks = await TrackModel.find<TrackFromApi>({ upc: song.upc });

    if (tracks.length < 2) {
      throw new Error('Tracks not found or less than 2.');
    }

    console.log("approve album", song);

    let releaseType = "";

    if (tracks.length > 1 && tracks.length <= 6) {
      releaseType = "EP";
    } else if (tracks.length > 6) {
      releaseType = "Album";
    }

    // 2. Create the metadata object in the other collection
    const metadata = await DpmMetaData.create(
      [
        {
          "distribution-id": "MD1413",
          "label": label,
          "release-type": releaseType,
          "upc": song.upc,
          "client-release-reference": "soundmac-release-" + song.upc,
          "catalog-number": song.catalogNumber,
          "album-release-id": song._id.toString(),
          "spotify-album-id": "",
          "apple-music-album-id": "",
          "album-main-artist": artistName,
          "album-main-artist-spotify-id": artistSpotifyId,
          "album-main-artist-apple-music-id": artistAppleId,
          "album-main-artist-tidal-id": "",
          "album-main-artist-deezer-id": "",
          "album-main-artist-audiomack-id": "",
          "secondary-language-album-main-artist": "",
          "album-featured-artist": [],
          "album-featured-artist-spotify-id": "",
          "album-featured-artist-apple-music-id": "",
          "album-featured-artist-tidal-id": "",
          "album-featured-artist-deezer-id": "",
          "album-featured-artist-audiomack-id": "",
          "album-with-artist": [],
          "album-with-artist-spotify-id": "",
          "album-with-artist-apple-music-id": "",
          "album-with-artist-tidal-id": "",
          "album-with-artist-deezer-id": "",
          "album-with-artist-audiomack-id": "",
          "album-remixer": [],
          "album-remixer-spotify-id": "",
          "album-remixer-apple-music-id": "",
          "album-remixer-tidal-id": "",
          "album-remixer-deezer-id": "",
          "album-remixer-audiomack-id": "",
          "secondary-language-album-featured-artist": "",
          "album-title": song.releaseTitle,
          "album-subtitle": "",
          "secondary-language-album-title": "",
          "secondary-language-album-subtitle": "",
          "genre": song.genre,
          "original-release-date": new Date(song.releaseDate).toISOString().split("T")[0],
          "release-date": new Date(song.releaseDate).toISOString().split("T")[0],
          "release-date-time": "00:00",
          "release-date-timezone": song.timeZone?.value || "UTC",
          "dsp-release-date-overrides-enabled": "No",
          "dsp-release-date-overrides": {},
          "pre-order": song.preOrderCheck ? "Yes" : "No",
          "pre-order-date": song.preOrderDate ? new Date(song.preOrderDate).toISOString().split("T")[0] : "",
          "pre-order-time": "00:00",
          "pre-order-timezone": song.timeZone?.value || "UTC",
          "cover-art-ai-disclosure": "none",
          "youtube-eligibility-sounds-original": "No",
          "youtube-eligibility-isrc-authorization": "No",
          "youtube-eligibility-capitalization-notice": "No",
          "youtube-eligibility-no-promo-services": "No",
          "youtube-eligibility-no-sample-libraries": "No",
          "youtube-eligibility-no-remix-reuse": "No",
          "youtube-eligibility-no-public-domain": "No",
          "youtube-eligibility-no-film-audio": "No",
          "youtube-eligibility-no-youtube-audio": "No",
          "youtube-eligibility-content-id-owner": "No",
          "youtube-eligibility-no-other-content-id": "No",
          "youtube-eligibility-youtube-consequences": "No",
          "youtube-eligibility-worldwide-rights": "No",
          "youtube-eligibility-no-name-misuse": "No",
          "youtube-eligibility-terms-accepted": "No",
          "legal-terms-accepted": "No",
          "parental-advisory": "",
          "c-line": `℗ ${song.copyRightYear} ${song.copyRightHolder}`,
          "p-line": `℗ ${song.copyRightYear} ${song.copyRightHolder}`,
          "territory-availability": song.territories.join(","),
          "album-srp": 0.99,
          "album-srp-currency": "USD",
          "keywords": "",
          "description": song.description,
          "page-name": "",
          "page-url": "",
          "page-user": "",
          "release-display-date": "",
          "track-listing-preview-date": "",
          "cover-art-preview-date": "",
          "pre-order-preview-date": "",
          "clip-preview-date": "",
          "effective-date": "",
          "disc-number": 1,
          "track-number": 1,
          "client-track-reference": `soundmac-release-${song.upc}-track-1`,
          "track-title": song.releaseTitle,
          "track-subtitle": "",
          "secondary-language-track-title": "",
          "secondary-language-track-subtitle": "",
          "track-main-artist": artistName,
          "track-main-artist-spotify-id": artistSpotifyId,
          "track-main-artist-apple-music-id": artistAppleId,
          "track-main-artist-tidal-id": "",
          "track-main-artist-deezer-id": "",
          "track-main-artist-audiomack-id": "",
          "secondary-language-track-main-artist": "",
          "track-featured-artist": [],
          "track-featured-artist-spotify-id": "",
          "track-featured-artist-apple-music-id": "",
          "track-featured-artist-tidal-id": "",
          "track-featured-artist-deezer-id": "",
          "track-featured-artist-audiomack-id": "",
          "track-with-artist": [],
          "track-with-artist-spotify-id": "",
          "track-with-artist-apple-music-id": "",
          "track-with-artist-tidal-id": "",
          "track-with-artist-deezer-id": "",
          "track-with-artist-audiomack-id": "",
          "track-remixer-artist": [],
          "remixer-spotify-id": "",
          "remixer-apple-music-id": "",
          "remixer-tidal-id": "",
          "remixer-deezer-id": "",
          "remixer-audiomack-id": "",
          "secondary-language-track-featured-artist": "",
          "track-audio-language": song.releaseLanguage,
          "language-of-performance": song.releaseLanguage,
          "country-of-recording": "",
          "year-of-recording": song.copyRightYear,
          "track-length": "",
          "isrc-code": "",
          "video-isrc-code": "",
          "iswc-code": "",
          "track-release-id": song._id,
          "spotify-track-id": "",
          "apple-music-track-id": "",
          "mix-version": "Original",
          "composition-type": "",
          "instrumental-source": "",
          "instrumental-license-files": "",
          "samples-used": "",
          "sample-clearance-files": "",
          "cover-song-license-file": "",
          "publishing-split-sheet-available": "No",
          "publishing-split-sheet-file": "",
          "copyright-registration-available": "No",
          "copyright-registration-files": "",
          "work-for-hire-available": "No",
          "work-for-hire-files": "",
          "work-for-hire-acknowledged": "No",
          "work-for-hire-contributor-legal-name": "",
          "work-for-hire-contributor-professional-name": "",
          "work-for-hire-contributor-role": "",
          "work-for-hire-agreement-date": "",
          "work-for-hire-hiring-party": "",
          "work-for-hire-material-covered": "",
          "work-for-hire-notes": "",
          "custom-id": "",
          "youtube-description": "",
          "age-restriction": "",
          "clip-start-time": "",
          "clip-duration": "",
          "tiktok-clip-start-seconds": "",
          "tiktok-clip-duration-minutes": "",
          "composer": "",
          "lyricist": "",
          "publisher": "",
          "lyrics": "",
          "lyrics-available": "",
          "download-purchase": "Y",
          "subscription-streaming": "Y",
          "ad-supported-streaming": "Y",
          "performance-royalties": "N",
          "track-srp": 0.99,
          "track-srp-currency": "USD",
          "selected-dsps": song.dsp.map((item) => item.label).join(","),
          "delivery-action-type": "InitialDelivery",
          "performer": artistName,
          "track-performer-credits": [],
          "track-writer-credits": [],
          "track-additional-credits": [
          ],
          "music-producer": "",
          "co-producer": "",
          "assistant-engineer": "",
          "engineer": "",
          "mixer": "",
          "mixing-engineer": "",
          "recording-engineer": "",
          "mastering-engineer": "",
          "graphic-design": "",
          "video-director": "",
          "video-producer": "",
          "remixer": "",
          "arranger": "",
          "actor": "",
          "playback-singer": "",
          "film-director": "",
          "music-director": "",
          "directors": "",
          "producers": "",
          "editors": "",
          "crew": "",
          "conductor": "",
          "soloist": "",
          "orchestra": "",
          "provided-by": song.providedBy,
          "courtesy-line": song.courtesyLine,
        },
        ...tracks.map((track, index) => (
          {
            "distribution-id": "MD1413",
            "label": label,
            "release-type": "track",
            "upc": song.upc,
            "client-release-reference": "soundmac-release-" + song.upc,
            "catalog-number": song.catalogNumber,
            "album-release-id": song._id.toString(),
            "spotify-album-id": "",
            "apple-music-album-id": "",
            "album-main-artist": artistName,
            "album-main-artist-spotify-id": artistSpotifyId,
            "album-main-artist-apple-music-id": artistAppleId,
            "album-main-artist-tidal-id": "",
            "album-main-artist-deezer-id": "",
            "album-main-artist-audiomack-id": "",
            "secondary-language-album-main-artist": "",
            "album-featured-artist": [],
            "album-featured-artist-spotify-id": "",
            "album-featured-artist-apple-music-id": "",
            "album-featured-artist-tidal-id": "",
            "album-featured-artist-deezer-id": "",
            "album-featured-artist-audiomack-id": "",
            "album-with-artist": [],
            "album-with-artist-spotify-id": "",
            "album-with-artist-apple-music-id": "",
            "album-with-artist-tidal-id": "",
            "album-with-artist-deezer-id": "",
            "album-with-artist-audiomack-id": "",
            "album-remixer": [],
            "album-remixer-spotify-id": "",
            "album-remixer-apple-music-id": "",
            "album-remixer-tidal-id": "",
            "album-remixer-deezer-id": "",
            "album-remixer-audiomack-id": "",
            "secondary-language-album-featured-artist": "",
            "album-title": song.releaseTitle,
            "album-subtitle": "",
            "secondary-language-album-title": "",
            "secondary-language-album-subtitle": "",
            "genre": track.genre,
            "original-release-date": new Date(song.releaseDate).toISOString().split("T")[0],
            "release-date": new Date(song.releaseDate).toISOString().split("T")[0],
            "release-date-time": "00:00",
            "release-date-timezone": song.timeZone?.value || "UTC",
            "dsp-release-date-overrides-enabled": "No",
            "dsp-release-date-overrides": {},
            "pre-order": song.preOrderCheck ? "Yes" : "No",
            "pre-order-date": song.preOrderDate ? new Date(song.preOrderDate).toISOString().split("T")[0] : "",
            "pre-order-time": "00:00",
            "pre-order-timezone": song.timeZone?.value || "UTC",
            "cover-art-ai-disclosure": "none",
            "youtube-eligibility-sounds-original": "No",
            "youtube-eligibility-isrc-authorization": "No",
            "youtube-eligibility-capitalization-notice": "No",
            "youtube-eligibility-no-promo-services": "No",
            "youtube-eligibility-no-sample-libraries": "No",
            "youtube-eligibility-no-remix-reuse": "No",
            "youtube-eligibility-no-public-domain": "No",
            "youtube-eligibility-no-film-audio": "No",
            "youtube-eligibility-no-youtube-audio": "No",
            "youtube-eligibility-content-id-owner": "No",
            "youtube-eligibility-no-other-content-id": "No",
            "youtube-eligibility-youtube-consequences": "No",
            "youtube-eligibility-worldwide-rights": "No",
            "youtube-eligibility-no-name-misuse": "No",
            "youtube-eligibility-terms-accepted": "No",
            "legal-terms-accepted": "No",
            "parental-advisory": track.explicitContent ? "Yes" : "No",
            "c-line": `℗ ${song.copyRightYear} ${song.copyRightHolder}`,
            "p-line": `℗ ${song.copyRightYear} ${song.copyRightHolder}`,
            "territory-availability": song.territories.join(","),
            "album-srp": 0.99,
            "album-srp-currency": "USD",
            "keywords": "",
            "description": "",
            "page-name": "",
            "page-url": "",
            "page-user": "",
            "release-display-date": "",
            "track-listing-preview-date": "",
            "cover-art-preview-date": "",
            "pre-order-preview-date": "",
            "clip-preview-date": "",
            "effective-date": "",
            "disc-number": 1,
            "track-number": track.trackNumber,
            "client-track-reference": `soundmac-release-${song.upc}-track-${track.trackNumber}`,
            "track-title": track.releaseTitle,
            "track-subtitle": "",
            "secondary-language-track-title": "",
            "secondary-language-track-subtitle": "",
            "track-main-artist": artistName,
            "track-main-artist-spotify-id": artistSpotifyId,
            "track-main-artist-apple-music-id": artistAppleId,
            "track-main-artist-tidal-id": "",
            "track-main-artist-deezer-id": "",
            "track-main-artist-audiomack-id": "",
            "secondary-language-track-main-artist": "",
            "track-featured-artist": track.featuredArtist
              .filter((item) => item.role === "Featured Artist")
              .map((item) => ({ name: item.artistName, role: item.role })),
            "track-featured-artist-spotify-id": "",
            "track-featured-artist-apple-music-id": "",
            "track-featured-artist-tidal-id": "",
            "track-featured-artist-deezer-id": "",
            "track-featured-artist-audiomack-id": "",
            "track-with-artist": track.featuredArtist
              .filter((item) => item.role === "With")
              .map((item) => ({ name: item.artistName, role: item.role })),
            "track-with-artist-spotify-id": "",
            "track-with-artist-apple-music-id": "",
            "track-with-artist-tidal-id": "",
            "track-with-artist-deezer-id": "",
            "track-with-artist-audiomack-id": "",
            "track-remixer-artist": track.featuredArtist
              .filter((item) => item.role === "Remixer")
              .map((item) => ({ name: item.artistName, role: item.role })),
            "remixer-spotify-id": "",
            "remixer-apple-music-id": "",
            "remixer-tidal-id": "",
            "remixer-deezer-id": "",
            "remixer-audiomack-id": "",
            "secondary-language-track-featured-artist": "",
            "track-audio-language": track.releaseLanguage,
            "language-of-performance": track.releaseLanguage,
            "country-of-recording": track.countryOfRecording,
            "year-of-recording": song.copyRightYear,
            "track-length": "",
            "isrc-code": track.isrc,
            "video-isrc-code": "",
            "iswc-code": "",
            "track-release-id": song._id,
            "spotify-track-id": "",
            "apple-music-track-id": "",
            "mix-version": "Original",
            "composition-type": track.compositionType,
            "instrumental-source": track.instrumentalSource,
            "instrumental-license-files": track?.license,
            "samples-used": track.instrumentalSource === "Custom / exclusive production" ? "No" : "Yes",
            "sample-clearance-files": track?.license,
            "cover-song-license-file": track?.license,
            "publishing-split-sheet-available": "No",
            "publishing-split-sheet-file": "",
            "copyright-registration-available": "No",
            "copyright-registration-files": "",
            "work-for-hire-available": "No",
            "work-for-hire-files": "",
            "work-for-hire-acknowledged": "No",
            "work-for-hire-contributor-legal-name": "",
            "work-for-hire-contributor-professional-name": "",
            "work-for-hire-contributor-role": "",
            "work-for-hire-agreement-date": "",
            "work-for-hire-hiring-party": "",
            "work-for-hire-material-covered": "",
            "work-for-hire-notes": "",
            "custom-id": "",
            "youtube-description": "",
            "age-restriction": "",
            "clip-start-time": track.startClip,
            "clip-duration": track.startClip,
            "tiktok-clip-start-seconds": track.startClip,
            "tiktok-clip-duration-minutes": track.startClip? (parseInt(track.startClip, 10) / 60).toFixed(2).toString() : "",
            "composer": "",
            "lyricist": "",
            "publisher": "",
            "lyrics": track.lyrics,
            "lyrics-available": track.lyrics ? "Y" : "N",
            "download-purchase": "Y",
            "subscription-streaming": "Y",
            "ad-supported-streaming": "Y",
            "performance-royalties": "N",
            "track-srp": 0.99,
            "track-srp-currency": "USD",
            "selected-dsps": song.dsp.map((dsp) => dsp.label).join(", "),

            "delivery-action-type": "InitialDelivery",

            "performer": artistName,

            "track-performer-credits": track.performer.map((item, index) => ({
              "name": item.name,
              "role": item.role
            })),

            "track-writer-credits": track.songWriter.map((item, index) => ({
              "name": item.first_name + " " + item.last_name,
              "role": "song-writer"
            })),

            "track-additional-credits": [],

            "music-producer": track.producer
              .filter((item) => item.role?.toLowerCase() === "music-producer")
              .map((item) => item.name).join(", "),

            "co-producer": track.producer
              .filter((item) => item.role?.toLowerCase() === "co-producer")
              .map((item) => item.name).join(", "),

            "assistant-engineer": track.producer
              .filter((item) => item.role?.toLowerCase() === "assistant-engineer")
              .map((item) => item.name).join(", "),

            "engineer": track.producer
              .filter((item) => item.role?.toLowerCase() === "engineer")
              .map((item) => item.name).join(", "),

            "mixer": track.producer
              .filter((item) => item.role?.toLowerCase() === "mixer")
              .map((item) => item.name).join(", "),

            "mixing-engineer": track.producer
              .filter((item) => item.role?.toLowerCase() === "mixing-engineer")
              .map((item) => item.name).join(", "),

            "recording-engineer": track.producer
              .filter((item) => item.role?.toLowerCase() === "recording-engineer")
              .map((item) => item.name).join(", "),

            "mastering-engineer": track.producer
              .filter((item) => item.role?.toLowerCase() === "mastering-engineer")
              .map((item) => item.name).join(", "),

            "graphic-design": track.producer
              .filter((item) => item.role?.toLowerCase() === "graphic-design")
              .map((item) => item.name).join(", "),

            "video-director": track.producer
              .filter((item) => item.role?.toLowerCase() === "video-director")
              .map((item) => item.name).join(", "),

            "video-producer": track.producer
              .filter((item) => item.role?.toLowerCase() === "video-producer")
              .map((item) => item.name).join(", "),

            "remixer": track.producer
              .filter((item) => item.role?.toLowerCase() === "remixer")
              .map((item) => item.name).join(", "),

            "arranger": track.producer
              .filter((item) => item.role?.toLowerCase() === "arranger")
              .map((item) => item.name).join(", "),

            "actor": track.producer
              .filter((item) => item.role?.toLowerCase() === "actor")
              .map((item) => item.name).join(", "),

            "playback-singer": track.producer
              .filter((item) => item.role?.toLowerCase() === "playback-singer")
              .map((item) => item.name).join(", "),

            "film-director": track.producer
              .filter((item) => item.role?.toLowerCase() === "film-director")
              .map((item) => item.name).join(", "),

            "music-director": track.producer
              .filter((item) => item.role?.toLowerCase() === "music-director")
              .map((item) => item.name).join(", "),

            "directors": track.producer
              .filter((item) => item.role?.toLowerCase() === "directors")
              .map((item) => item.name).join(", "),

            "producers": track.producer
              .filter((item) => item.role?.toLowerCase() === "producers")
              .map((item) => item.name).join(", "),

            "editors": track.producer
              .filter((item) => item.role?.toLowerCase() === "editors")
              .map((item) => item.name).join(", "),

            "crew": track.producer
              .filter((item) => item.role?.toLowerCase() === "crew")
              .map((item) => item.name).join(", "),

            "conductor": track.producer
              .filter((item) => item.role?.toLowerCase() === "conductor")
              .map((item) => item.name).join(", "),

            "soloist": track.producer
              .filter((item) => item.role?.toLowerCase() === "soloist")
              .map((item) => item.name).join(", "),

            "orchestra": track.producer
              .filter((item) => item.role?.toLowerCase() === "orchestra")
              .map((item) => item.name).join(", "),

            "provided-by": song.providedBy,
            "courtesy-line": song.courtesyLine,
          }
        ))],
      { session: session, ordered: true } // Note: .create() expects an array when using sessions
    );

    // return { song, metadata: metadata[0] };
    await session.commitTransaction();
    return { error: false, msg: "Release Approved" }
  } catch (error: any) {
    console.error("failed to approve album ", error);
    // ✅ Only abort if a transaction is actually open
    if (session.inTransaction()) {
      console.log("in transmission");

      await session.abortTransaction();
    }
    return { error: true, msg: error?.message || "Failed to approve Album" }
  } finally {
    await session.endSession();
  }
};

const AlbumModel =
  mongoose.models?.Album || mongoose.model("Album", AlbumSchema);

export default AlbumModel;
