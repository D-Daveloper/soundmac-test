import mongoose, { ObjectId } from "mongoose";
import DpmMetaData from "./DpmCallBackModel";
import { CheckboxOption, songFromApi } from "@/app/type";
import { compositionTypes, country_list, instrumentalSources, otherArtistRoles, performerRoles, producerRoles } from "@/app/utils/constants";

export const featuredArtistSchema = new mongoose.Schema(
  {
    artistName: {
      type: String,
      // required: [true, "Artist name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "artistName must be a string",
      },
    },
    spotifyId: {
      type: String,
      // // required: [true, 'Spotify ID is required']
    },
    appleId: {
      type: String,
      // // required: [true, 'Apple ID is required']
    },
    role: {
      type: String,
      // required: [true, "Role is required"],
      validate: {
        validator: (v: any) => typeof v === "string" || otherArtistRoles.includes(v),
        message: "Role must be a string",
      },
    },
  },
  { _id: false, strict: "throw" },
);

export const performerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Performer name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Performer name must be a string",
      },
    },
    role: {
      type: String,
      required: [true, "Performer role is required"],
      validate: {
        validator: (v: any) => typeof v === "string" || performerRoles.includes(v),
        message: "Performer role must be a string",
      },
    },
  },
  { _id: false, strict: "throw" },
);

export const songWriterSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Song writer first name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Song writer first name must be a string",
      },
    },
    last_name: {
      type: String,
      required: [true, "Song writer last name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Song writer last name must be a string",
      },
    },
  },
  { _id: false, strict: "throw" },
);

export const producerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Producer name is required"],
      validate: {
        validator: (v: any) => typeof v === "string",
        message: "Producer name must be a string",
      },
    },
    role: {
      type: String,
      required: [true, "Producer role is required"],
      validate: {
        validator: (v: any) => typeof v === "string" || producerRoles.includes(v),
        message: "Producer role must be a string",
      },
    },
  },
  { _id: false, strict: "throw" },
);

const SongModelSchema = new mongoose.Schema(
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
      default: null,
    },
    featuredArtist: {
      type: [featuredArtistSchema],
      // required: [true, 'Featured artist is required'],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v);
        },
        message: "At least one featured artist is required",
      },
      default: undefined,
    },
    performer: {
      type: [performerSchema],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Performer is required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one performer is required",
      },
    },
    songWriter: {
      type: [songWriterSchema],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Song writer is required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one song writer is required",
      },
    },
    producer: {
      type: [producerSchema],
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Producer is required",
      ],
      validate: {
        validator: function (this: any, v: any[]) {
          if (this.get("releaseStatus") === "draft") {
            return true; // Skip validation for draft songs
          }
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one producer is required",
      },
    },
    preOrderCheck: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Pre-order check is required",
      ],
      // default: false,
    },
    anotherDistributionCheck: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Another distribution check is required",
      ],
      // default: false,
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
    releaseAudio: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Song audio URL is required",
      ],
      trim: true,
    },
    releaseImage: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Music image URL is required",
      ],
      trim: true,
    },
    isCoverSong: {
      type: Boolean,
      required: [true,
        "Cover song is required",
      ],
    },
    license: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft" && this.get("compositionType") === "Cover Song";
        },
        "License URL is required",
      ],
      trim: true,
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
    lyrics: {
      type: String,
      // required: [true, 'Lyrics are required'],
      trim: true,
    },
    startClip: {
      type: String,
      // required: [
      //   function (this: any) {
      //     return this.get("releaseStatus") !== "draft";
      //   },
      //   "Start clip is required",
      // ],
      trim: true,
    },
    isrc: {
      type: String,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "ISRC is required",
      ],
      trim: true,
      uppercase: true,
      // unique:true
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
    explicitContent: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.get("releaseStatus") !== "draft";
        },
        "Explicit content flag is required",
      ],
    },
    releaseStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft", "inactive"],
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
    providedBy: {
      type: String,
      required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Provided by is required"],
      trim: true,
      validate: {
        validator: async function (v: any) {
          // const userType = await mongoose.model("User").findById(this.user).select("type");
          // console.log("userType", userType, this.user);
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
    compositionType: {
      type: String, required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Composition type is required"], trim: true, enum: compositionTypes
    },
    instrumentalSource: {
      type: String, required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Instrumental source is required"], trim: true, enum: instrumentalSources
    },
    countryOfRecording: {
      type: String, required: [function (this: any) {
        return this.get("releaseStatus") !== "draft";
      }, "Country of recording is required"], trim: true, enum: country_list
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Uniqueness constraints
SongModelSchema.index(
  { user: 1, artist: 1, releaseTitle: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
    partialFilterExpression: { releaseStatus: { $ne: "inactive" } },
  }
);

SongModelSchema.index({ catalogNumber: 1 }, {
  unique: true,
  partialFilterExpression: {
    catalogNumber: { $exists: true, $type: "string" },
    releaseStatus: { $ne: "inactive" },
  },
});

SongModelSchema.index({ isrc: 1 }, {
  unique: true,
  partialFilterExpression: {
    isrc: { $exists: true, $type: "string" },
    releaseStatus: { $ne: "inactive" },
  },
});

SongModelSchema.index({ upc: 1 }, {
  unique: true,
  partialFilterExpression: {
    upc: { $exists: true, $type: "string" },
    releaseStatus: { $ne: "inactive" },
  },
});

// Admin endpoint
SongModelSchema.index({ createdAt: -1 }); // no filters
SongModelSchema.index({ releaseStatus: 1, createdAt: -1 }); // status only
SongModelSchema.index(
  { releaseTitle: 1, createdAt: -1 },
  { collation: { locale: "en", strength: 2 } },
); // admin search

// User-scoped queries (keep if used elsewhere in your app)
SongModelSchema.index({ user: 1, createdAt: -1 });
// delete mongoose.models.Song;
/**
 * Static method to approve a song and create metadata atomically
 * @param {ObjectId} songId - The ID of the song to approve
 * @param {string} label - The user label
 */
SongModelSchema.statics.approveAndCreateMetadata = async function (songId: ObjectId, artistName, artistSpotifyId, artistAppleId, label: string) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // 1. Update the song status
    const song: songFromApi = await this.findByIdAndUpdate(
      songId,
      { releaseStatus: 'approved', approvedAt: new Date() },
      { session, new: true } // Crucial: pass the session here
    );

    if (!song) {
      throw new Error('Song not found');
    }
    console.log("approve", song);

    // 2. Create the metadata object in the other collection
    const metadata = await DpmMetaData.create(
      [
        {
          "distribution-id": "MD1413",
          "label": label,
          "release-type": "Single",
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
          "album-featured-artist": song.featuredArtist
            .filter((item) => item.role === "Featured Artist")
            .map((item) => ({ name: item.artistName, role: item.role })),
          "album-featured-artist-spotify-id": "",
          "album-featured-artist-apple-music-id": "",
          "album-featured-artist-tidal-id": "",
          "album-featured-artist-deezer-id": "",
          "album-featured-artist-audiomack-id": "",
          "album-with-artist": song.featuredArtist
            .filter((item) => item.role === "With")
            .map((item) => ({ name: item.artistName, role: item.role })),
          "album-with-artist-spotify-id": "",
          "album-with-artist-apple-music-id": "",
          "album-with-artist-tidal-id": "",
          "album-with-artist-deezer-id": "",
          "album-with-artist-audiomack-id": "",
          "album-remixer": song.featuredArtist
            .filter((item) => item.role === "Remixer")
            .map((item) => ({ name: item.artistName, role: item.role })),
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
          "parental-advisory": song.explicitContent ? "Yes" : "No",
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
          "track-featured-artist": song.featuredArtist
            .filter((item) => item.role === "Featured Artist")
            .map((item) => ({ name: item.artistName, role: item.role })),
          "track-featured-artist-spotify-id": "",
          "track-featured-artist-apple-music-id": "",
          "track-featured-artist-tidal-id": "",
          "track-featured-artist-deezer-id": "",
          "track-featured-artist-audiomack-id": "",
          "track-with-artist": song.featuredArtist
            .filter((item) => item.role === "With")
            .map((item) => ({ name: item.artistName, role: item.role })),
          "track-with-artist-spotify-id": "",
          "track-with-artist-apple-music-id": "",
          "track-with-artist-tidal-id": "",
          "track-with-artist-deezer-id": "",
          "track-with-artist-audiomack-id": "",
          "track-remixer-artist": song.featuredArtist
            .filter((item) => item.role === "Remixer")
            .map((item) => ({ name: item.artistName, role: item.role })),
          "remixer-spotify-id": "",
          "remixer-apple-music-id": "",
          "remixer-tidal-id": "",
          "remixer-deezer-id": "",
          "remixer-audiomack-id": "",
          "secondary-language-track-featured-artist": "",
          "track-audio-language": song.releaseLanguage,
          "language-of-performance": song.releaseLanguage,
          "country-of-recording": song.countryOfRecording,
          "year-of-recording": song.copyRightYear,
          "track-length": "",
          "isrc-code": song.isrc,
          "video-isrc-code": "",
          "iswc-code": "",
          "track-release-id": song._id,
          "spotify-track-id": "",
          "apple-music-track-id": "",
          "mix-version": "Original",
          "composition-type": song.compositionType,
          "instrumental-source": song.instrumentalSource,
          "instrumental-license-files": song.license,
          "samples-used": song.instrumentalSource === "Custom / exclusive production" ? "No" : "Yes",
          "sample-clearance-files": song.license,
          "cover-song-license-file": song.license,
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
          "clip-start-time": song.startClip,
          "clip-duration": song.startClip,
          "tiktok-clip-start-seconds": song.startClip,
          "tiktok-clip-duration-minutes": song.startClip? (parseInt(song.startClip, 10) / 60).toFixed(2).toString() : "",
          "composer": "",
          "lyricist": "",
          "publisher": "",
          "lyrics": song.lyrics,
          "lyrics-available": song.lyrics ? "Y" : "N",
          "download-purchase": "Y",
          "subscription-streaming": "Y",
          "ad-supported-streaming": "Y",
          "performance-royalties": "N",
          "track-srp": 0.99,
          "track-srp-currency": "USD",
          "selected-dsps": song.dsp.map((dsp) => dsp.label).join(", "),

          "delivery-action-type": "InitialDelivery",

          "performer": artistName,

          "track-performer-credits": song.performer.map((item, index) => ({
            "name": item.name,
            "role": item.role
          })),

          "track-writer-credits": song.songWriter.map((item, index) => ({
            "name": item.first_name + " " + item.last_name,
            "role": "song-writer"
          })),

          "track-additional-credits": [],

          "music-producer": song.producer
            .filter((item) => item.role?.toLowerCase() === "music-producer")
            .map((item) => item.name).join(", "),

          "co-producer": song.producer
            .filter((item) => item.role?.toLowerCase() === "co-producer")
            .map((item) => item.name).join(", "),

          "assistant-engineer": song.producer
            .filter((item) => item.role?.toLowerCase() === "assistant-engineer")
            .map((item) => item.name).join(", "),

          "engineer": song.producer
            .filter((item) => item.role?.toLowerCase() === "engineer")
            .map((item) => item.name).join(", "),

          "mixer": song.producer
            .filter((item) => item.role?.toLowerCase() === "mixer")
            .map((item) => item.name).join(", "),

          "mixing-engineer": song.producer
            .filter((item) => item.role?.toLowerCase() === "mixing-engineer")
            .map((item) => item.name).join(", "),

          "recording-engineer": song.producer
            .filter((item) => item.role?.toLowerCase() === "recording-engineer")
            .map((item) => item.name).join(", "),

          "mastering-engineer": song.producer
            .filter((item) => item.role?.toLowerCase() === "mastering-engineer")
            .map((item) => item.name).join(", "),

          "graphic-design": song.producer
            .filter((item) => item.role?.toLowerCase() === "graphic-design")
            .map((item) => item.name).join(", "),

          "video-director": song.producer
            .filter((item) => item.role?.toLowerCase() === "video-director")
            .map((item) => item.name).join(", "),

          "video-producer": song.producer
            .filter((item) => item.role?.toLowerCase() === "video-producer")
            .map((item) => item.name).join(", "),

          "remixer": song.producer
            .filter((item) => item.role?.toLowerCase() === "remixer")
            .map((item) => item.name).join(", "),

          "arranger": song.producer
            .filter((item) => item.role?.toLowerCase() === "arranger")
            .map((item) => item.name).join(", "),

          "actor": song.producer
            .filter((item) => item.role?.toLowerCase() === "actor")
            .map((item) => item.name).join(", "),

          "playback-singer": song.producer
            .filter((item) => item.role?.toLowerCase() === "playback-singer")
            .map((item) => item.name).join(", "),

          "film-director": song.producer
            .filter((item) => item.role?.toLowerCase() === "film-director")
            .map((item) => item.name).join(", "),

          "music-director": song.producer
            .filter((item) => item.role?.toLowerCase() === "music-director")
            .map((item) => item.name).join(", "),

          "directors": song.producer
            .filter((item) => item.role?.toLowerCase() === "directors")
            .map((item) => item.name).join(", "),

          "producers": song.producer
            .filter((item) => item.role?.toLowerCase() === "producers")
            .map((item) => item.name).join(", "),

          "editors": song.producer
            .filter((item) => item.role?.toLowerCase() === "editors")
            .map((item) => item.name).join(", "),

          "crew": song.producer
            .filter((item) => item.role?.toLowerCase() === "crew")
            .map((item) => item.name).join(", "),

          "conductor": song.producer
            .filter((item) => item.role?.toLowerCase() === "conductor")
            .map((item) => item.name).join(", "),

          "soloist": song.producer
            .filter((item) => item.role?.toLowerCase() === "soloist")
            .map((item) => item.name).join(", "),

          "orchestra": song.producer
            .filter((item) => item.role?.toLowerCase() === "orchestra")
            .map((item) => item.name).join(", "),

          "provided-by": song.providedBy,
          "courtesy-line": song.courtesyLine,
        }
      ],
      { session } // Note: .create() expects an array when using sessions
    );

    // return { song, metadata: metadata[0] };
    await session.commitTransaction();
    return { error: false, msg: "Release Approved" }
  } catch (error) {
    console.error("failed to approve release ", error);
    // ✅ Only abort if a transaction is actually open
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return { error: true, msg: "Failed to approve release" }
  } finally {
    await session.endSession();
  }
};
const SongModel: any =
  mongoose.models?.Song || mongoose.model<any>("Song", SongModelSchema);

export default SongModel;
// Pre-validation hook to enforce required fields based on releaseStatus
SongModelSchema.pre("validate", function (next) {
  if (this.releaseStatus !== "draft") {
    const requiredFields = [
      "releaseTitle",
      "releaseAudio",
      "releaseImage",
      "isrc",
      "upc",
    ];

    for (const field of requiredFields) {
      if (!(this as any)[field]) {
        this.invalidate(field, `${field} is required before publishing`);
      }
    }
  }
  next();
});

// const SongSchema = new mongoose.Schema(
//   {
//     songTitle: { type: String, required: true, trim: true },
//     artist: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Artist",
//       required: true,
//     },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who uploaded
//     durationSec: { type: Number, required: [true, "Provide song duration."] },
//     releaseDate: { type: Date, required: [true, "Provide release date."] },
//     DSPs: [
//       { type: Array, required: [true, "Provide distribution platforms"] },
//     ], // e.g. ['spotify','apple','youtube']
//     producerBy: [
//       { type: [String], required: [true, "Provide at least one producer"] },
//     ],
//     performedBy: [
//       { type: [String], required: [true, "Provide at least one performer"] },
//     ],
//     image: { type: String, required: [true, "Provide Image"] },
//     // audio: String,
//     isrc: { type: String, index: true, unique:true, required:[true, "Provide a isrc"] },
//     upc: { type: String, index: true, unique:true, required:[true, "Provide a upc"] },
//     status: { type: String, default: "draft" }, // draft, published, archived
//     // denormalized snapshot for fast read:
//     artistName: { type: String, index: true, unique:true, required:[true, "Provide a artist name"] },
//     copyRightHolder: String,
//     copyRightYear: String,
//     language:{type:String,required: [true,"Provide language"]},
//     genre:{type:String,required: [true,"Provide genre"]},
//     explicit:{type:String,required:[true,"Explicit is required"]},
//     featuredArtist:[String],
//     otherArtist:String,
//     writtenBy:{type:String,required:[true,"Provide who wrote the song"]},
//     lyrics:{type:String,required:[true,"Provide lyrics"]},
//     pitchEditorialPlaylist:{type:String,required:[true,"Select whether or not to pitch to editorial playist"]},
//     selectedPlatforms:[{type:String,required:[true,"Provide platforms to publish"]}],
//     selectTimeZone:{type:String,required:[true,"Provide timeZone"]},
//     hasOnlineBeats:{type:String,required:[true,"Provide whether or not the song has an online beat"]},
//     previouslyReleased:{type:String,required:[true,"Provide whether or not the song has been released"]},
//     billboardPayment:{type:Boolean,required:[true,"Select whether or not to pay for bill board"]},
//     catalogNumber:{type:String,required:[true,"Provide catalog number"]},
//     s3KeyAudio:{type:String,required:[true,"Provide s3 audio key"]},
//   },
//   { timestamps: true }
// );

// // Indexes
// SongSchema.index({ artist: 1, releaseDate: -1 }); // list songs by artist newest first
// SongSchema.index({ user: 1, createdAt: -1 }); // user uploads list
// SongSchema.index({ songTitle: "text", artistName: "text",upc:"text" }); // search songs by title/artist
// SongSchema.index({upc:"text"});
// SongSchema.index({ isrc: 1 }, { unique: false, sparse: true });//what sparse does here is, it helps when the field is an optional field, meaning it skips docs that dont have that field you want to index, this helps to save disk space and other things
// ✅ Fix Next.js hot reload issue by deleting existing model

// // Model creation
// const SongModel: Model<Document> =
//   mongoose.models.SongModel || mongoose.model<Document>("SongModel", SongSchema);

// // Model creation
// export default SongModel;
