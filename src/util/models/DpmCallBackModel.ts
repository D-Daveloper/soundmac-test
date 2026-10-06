// import mongoose from "mongoose";


// const dpmCallBackSchema = new mongoose.Schema({
//     label: {
//         type: String,
//         default: "Independent Artist",
//         required: true
//     },
//     "release-type": { type: String, required: [true, "Release type is required"] },
//     upc: { type: String, required: [true, "UPC is required"], index: true },
//     "catalog-number": { type: String, required: [true, "Catalog number is required"], unique: true },
//     "album-release-id": { type: String, required: [true, "Album release ID is required"] },
//     "album-main-artist": { type: String, required: [true, "Album main artist is required"] },
//     "secondary-language-album-main-artist": { type: String, default: "" },
//     "album-featured-artist": { type: String, default: "" },
//     "secondary-language-album-featured-artist": { type: String, default: "" },
//     "album-title": { type: String, default: "" },
//     "album-subtitle": { type: String, default: "" },
//     "secondary-language-album-title": { type: String, default: "" },
//     "secondary-language-album-subtitle": { type: String, default: "" },
//     genre: { type: String, required: [true, "Genre is required"] },
//     "release-date": { type: String, required: [true, "Release date is required"] },
//     "release-date-time": { type: String, required: [true, "Release Time is required"], },
//     "release-date-timezone": { type: String, required: [true, "Release Timezone is required"], },
//     "parental-advisory": { type: String, default: "" },
//     "c-line": { type: String, default: "" },
//     "disc-number": { type: Number, required: [true, "Disc number is required"] },
//     "track-number": { type: Number, required: [true, "Track number is required"] },
//     "track-title": {
//         type: String, required: [function (this: any) {
//             return this.get("release-type") !== "Album";
//         }, "Track title is required"]
//     },
//     "track-subtitle": { type: String, default: "" },
//     "secondary-language-track-title": { type: String, default: "" },
//     "secondary-language-track-subtitle": { type: String, default: "" },
//     "track-main-artist": { type: String, default: "" },
//     "secondary-language-track-main-artist": { type: String, default: "" },
//     "track-featured-artist": { type: String, default: "" },
//     "secondary-language-track-featured-artist": { type: String, default: "" },
//     "language-of-performance": { type: String, required: [true, "Language of performance is required"] },
//     "track-length": { type: String, default: "" },
//     "isrc-code": { type: String, default: "" },
//     "track-release-id": {
//         type: String, required: [function (this: any) {
//             return this.get("release-type") !== "Album";
//         }, "Track release ID is required"]
//     },
//     "p-line": { type: String, required: [true, "P-line is required"] },
//     "music-producer": { type: String, default: "" },
//     "remixer": { type: String, default: "" },
//     composer: {
//         type: String, required: [function (this: any) {
//             return this.get("release-type") !== "Album";
//         }, "Composer is required"]
//     },
//     lyricist: {
//         type: String, required: [function (this: any) {
//             return this.get("release-type") !== "Album";
//         }, "Lyricist is required"]
//     },
//     publisher: { type: String, default: "" },
//     "territory-availability": { type: String, default: "WW", required: [true, "Territory availability is required"] }, // Default to worldwide availability
//     "download-purchase": { type: String, default: "Y", required: [true, "Download Purchase is required"] },
//     "subscription-streaming": { type: String, default: "Y", required: [true, "Subscription Streaming is required"] },
//     "ad-supported-streaming": { type: String, default: "Y", required: [true, "Ad Supported Streaming is required"] },
//     "album-srp": { type: Number, default: 0.99, required: [true, "Album SRP is required"] },
//     "album-srp-currency": { type: String, default: "EUR", required: [true, "Album SRP currency is required"] },
//     "track-srp": { type: Number, default: 0.99, required: [true, "Track SRP is required"] },
//     "track-srp-currency": { type: String, default: "EUR", required: [true, "Track SRP currency is required"] },
//     actor: { type: String, default: "" },
//     "playback-singer": { type: String, default: "" },
//     "film-director": { type: String, default: "" },
//     "music-director": { type: String, default: "" },
//     "page-name": { type: String, default: "" },
//     "page-url": { type: String, default: "" },
//     "page-user": { type: String, default: "" },
//     keywords: { type: String, default: "" },
//     description: { type: String, default: "" },
//     "album-main-artist-id": { type: String, default: "" },
//     "track-main-artist-id": { type: String, default: "" },
//     "clip-start-time": { type: String, default: "" },
//     "clip-duration": { type: String, default: "" },

//     "effective-date": { type: String, default: "" },

//     "client-release-reference": { type: String, default: "" },

//     "album-main-artist-spotify-id": { type: String, default: "" },

//     "album-main-artist-apple-music-id": { type: String, default: "" },

//     "pre-order": { type: String, default: "" },

//     "client-track-reference": { type: String, default: "" },

//     "track-main-artist-spotify-id": { type: String, default: "" },

//     "track-main-artist-apple-music-id": { type: String, default: "" },

//     "track-audio-language": { type: String, default: "" },

//     "country-of-recording": { type: String, default: "" },

//     "year-of-recording": { type: String, default: "" },

//     "iswc-code": { type: String, default: "" },

//     "mix-version": { type: String, default: "" },

//     "composition-type": { type: String, default: "" },

//     "instrumental-source": { type: String, default: "" },

//     "samples-used": { type: String, default: "" },

//     "publishing-split-sheet-available": { type: String, default: "" },

//     "copyright-registration-available": { type: String, default: "" },

//     "work-for-hire-available": { type: String, default: "" },

//     lyrics: { type: String, default: "" },

//     "lyrics-available": { type: String, default: "" },

//     "performance-royalties": { type: String, default: "" },

//     "selected-dsps": { type: String, default: "" },

//     "delivery-action-type": { type: String, default: "" },

//     performer: { type: String, default: "" },

//     "co-producer": { type: String, default: "" },

//     "mixing-engineer": { type: String, default: "" },

//     "mastering-engineer": { type: String, default: "" },

//     "provided-by": { type: String, default: "" },

//     "courtesy-line": { type: String, default: "" },


//     "distribution-id": { type: String, default: "" },

//     "spotify-album-id": { type: String, default: "" },

//     "apple-music-album-id": { type: String, default: "" },

//     "album-main-artist-tidal-id": { type: String, default: "" },

//     "album-main-artist-deezer-id": { type: String, default: "" },

//     "album-main-artist-audiomack-id": { type: String, default: "" },

//     "album-featured-artist-spotify-id": { type: String, default: "" },

//     "album-featured-artist-apple-music-id": { type: String, default: "" },

//     "album-featured-artist-tidal-id": { type: String, default: "" },

//     "album-featured-artist-deezer-id": { type: String, default: "" },

//     "album-featured-artist-audiomack-id": { type: String, default: "" },

//     "album-with-artist": { type: String, default: "" },

//     "album-with-artist-spotify-id": { type: String, default: "" },

//     "album-with-artist-apple-music-id": { type: String, default: "" },

//     "album-with-artist-tidal-id": { type: String, default: "" },

//     "album-with-artist-deezer-id": { type: String, default: "" },

//     "album-with-artist-audiomack-id": { type: String, default: "" },

//     "album-remixer": { type: String, default: "" },

//     "album-remixer-spotify-id": { type: String, default: "" },

//     "album-remixer-apple-music-id": { type: String, default: "" },

//     "album-remixer-tidal-id": { type: String, default: "" },

//     "album-remixer-deezer-id": { type: String, default: "" },

//     "album-remixer-audiomack-id": { type: String, default: "" },

//     "original-release-date": { type: String, default: "" },

//     "dsp-release-date-overrides-enabled": { type: String, default: "" },

//     "dsp-release-date-overrides": { type: mongoose.Schema.Types.Mixed, default: {} },

//     "pre-order-date": { type: String, default: "" },

//     "pre-order-time": { type: String, default: "" },

//     "pre-order-timezone": { type: String, default: "" },

//     "cover-art-ai-disclosure": { type: String, default: "" },

//     "youtube-eligibility-sounds-original": { type: String, default: "" },

//     "youtube-eligibility-isrc-authorization": { type: String, default: "" },

//     "youtube-eligibility-capitalization-notice": { type: String, default: "" },

//     "youtube-eligibility-no-promo-services": { type: String, default: "" },

//     "youtube-eligibility-no-sample-libraries": { type: String, default: "" },

//     "youtube-eligibility-no-remix-reuse": { type: String, default: "" },

//     "youtube-eligibility-no-public-domain": { type: String, default: "" },

//     "youtube-eligibility-no-film-audio": { type: String, default: "" },

//     "youtube-eligibility-no-youtube-audio": { type: String, default: "" },

//     "youtube-eligibility-content-id-owner": { type: String, default: "" },

//     "youtube-eligibility-no-other-content-id": { type: String, default: "" },

//     "youtube-eligibility-youtube-consequences": { type: String, default: "" },

//     "youtube-eligibility-worldwide-rights": { type: String, default: "" },

//     "youtube-eligibility-no-name-misuse": { type: String, default: "" },

//     "youtube-eligibility-terms-accepted": { type: String, default: "" },

//     "legal-terms-accepted": { type: String, default: "" },

//     "release-display-date": { type: String, default: "" },

//     "track-listing-preview-date": { type: String, default: "" },

//     "cover-art-preview-date": { type: String, default: "" },

//     "pre-order-preview-date": { type: String, default: "" },

//     "clip-preview-date": { type: String, default: "" },

//     "track-main-artist-tidal-id": { type: String, default: "" },

//     "track-main-artist-deezer-id": { type: String, default: "" },

//     "track-main-artist-audiomack-id": { type: String, default: "" },

//     "track-featured-artist-spotify-id": { type: String, default: "" },

//     "track-featured-artist-apple-music-id": { type: String, default: "" },

//     "track-featured-artist-tidal-id": { type: String, default: "" },

//     "track-featured-artist-deezer-id": { type: String, default: "" },

//     "track-featured-artist-audiomack-id": { type: String, default: "" },

//     "track-with-artist": { type: String, default: "" },

//     "track-with-artist-spotify-id": { type: String, default: "" },

//     "track-with-artist-apple-music-id": { type: String, default: "" },

//     "track-with-artist-tidal-id": { type: String, default: "" },

//     "track-with-artist-deezer-id": { type: String, default: "" },

//     "track-with-artist-audiomack-id": { type: String, default: "" },

//     "remixer-spotify-id": { type: String, default: "" },

//     "remixer-apple-music-id": { type: String, default: "" },

//     "remixer-tidal-id": { type: String, default: "" },

//     "remixer-deezer-id": { type: String, default: "" },

//     "remixer-audiomack-id": { type: String, default: "" },

//     "video-isrc-code": { type: String, default: "" },

//     "instrumental-license-files": { type: String, default: "" },

//     "sample-clearance-files": { type: String, default: "" },

//     "cover-song-license-file": { type: String, default: "" },

//     "publishing-split-sheet-file": { type: String, default: "" },

//     "copyright-registration-files": { type: String, default: "" },

//     "work-for-hire-files": { type: String, default: "" },

//     "work-for-hire-acknowledged": { type: String, default: "" },

//     "work-for-hire-contributor-legal-name": { type: String, default: "" },

//     "work-for-hire-contributor-professional-name": { type: String, default: "" },

//     "work-for-hire-contributor-role": { type: String, default: "" },

//     "work-for-hire-agreement-date": { type: String, default: "" },

//     "work-for-hire-hiring-party": { type: String, default: "" },

//     "work-for-hire-material-covered": { type: String, default: "" },

//     "work-for-hire-notes": { type: String, default: "" },

//     "custom-id": { type: String, default: "" },

//     "youtube-description": { type: String, default: "" },

//     "age-restriction": { type: String, default: "" },

//     "tiktok-clip-start-seconds": { type: String, default: "" },

//     "tiktok-clip-duration-minutes": { type: String, default: "" },

//     "spotify-track-id": { type: String, default: "" },

//     "apple-music-track-id": { type: String, default: "" },

//     "track-performer-credits": {
//         type: [
//             {
//                 name: { type: String, default: "" },
//                 role: { type: String, default: "" }
//             }
//         ],
//         default: []
//     },

//     "track-writer-credits": {
//         type: [
//             {
//                 name: { type: String, default: "" },
//                 role: { type: String, default: "" }
//             }
//         ],
//         default: []
//     },

//     "track-additional-credits": {
//         type: [
//             {
//                 name: { type: String, default: "" },
//                 role: { type: String, default: "" }
//             }
//         ],
//         default: []
//     },

//     "assistant-engineer": { type: String, default: "" },

//     engineer: { type: String, default: "" },

//     mixer: { type: String, default: "" },

//     "recording-engineer": { type: String, default: "" },

//     "graphic-design": { type: String, default: "" },

//     "video-director": { type: String, default: "" },

//     "video-producer": { type: String, default: "" },

//     arranger: { type: String, default: "" },

//     directors: { type: String, default: "" },

//     producers: { type: String, default: "" },

//     editors: { type: String, default: "" },

//     crew: { type: String, default: "" },

//     conductor: { type: String, default: "" },

//     soloist: { type: String, default: "" },

//     orchestra: { type: String, default: "" },

// });

// const DpmMetaData = mongoose.models?.releaseMetaData || mongoose.model('releaseMetaData', dpmCallBackSchema);

// export default DpmMetaData;


import mongoose from "mongoose";

const creditSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const dpmCallBackSchema = new mongoose.Schema(
    {
        "distribution-id": {
            type: String,
            default: ""
        },

        label: {
            type: String,
            default: "Independent Artist"
        },

        "release-type": {
            type: String,
            default: ""
        },

        upc: {
            type: String,
            default: "",
            index: true
        },

        "client-release-reference": {
            type: String,
            default: ""
        },

        "catalog-number": {
            type: String,
            default: "",
            unique: true
        },

        "album-release-id": {
            type: String,
            default: ""
        },

        "spotify-album-id": {
            type: String,
            default: ""
        },

        "apple-music-album-id": {
            type: String,
            default: ""
        },

        "album-main-artist": {
            type: String,
            default: ""
        },

        "album-main-artist-spotify-id": {
            type: String,
            default: ""
        },

        "album-main-artist-apple-music-id": {
            type: String,
            default: ""
        },

        "album-main-artist-tidal-id": {
            type: String,
            default: ""
        },

        "album-main-artist-deezer-id": {
            type: String,
            default: ""
        },

        "album-main-artist-audiomack-id": {
            type: String,
            default: ""
        },

        "secondary-language-album-main-artist": {
            type: String,
            default: ""
        },

        "album-featured-artist": {
            type: [creditSchema],
            default: []
        },

        "album-featured-artist-spotify-id": {
            type: String,
            default: ""
        },

        "album-featured-artist-apple-music-id": {
            type: String,
            default: ""
        },

        "album-featured-artist-tidal-id": {
            type: String,
            default: ""
        },

        "album-featured-artist-deezer-id": {
            type: String,
            default: ""
        },

        "album-featured-artist-audiomack-id": {
            type: String,
            default: ""
        },

        "album-with-artist": {
            type: [creditSchema],
            default: []
        },

        "album-with-artist-spotify-id": {
            type: String,
            default: ""
        },

        "album-with-artist-apple-music-id": {
            type: String,
            default: ""
        },

        "album-with-artist-tidal-id": {
            type: String,
            default: ""
        },

        "album-with-artist-deezer-id": {
            type: String,
            default: ""
        },

        "album-with-artist-audiomack-id": {
            type: String,
            default: ""
        },

        "album-remixer": {
            type: [creditSchema],
            default: []
        },

        "album-remixer-spotify-id": {
            type: String,
            default: ""
        },

        "album-remixer-apple-music-id": {
            type: String,
            default: ""
        },

        "album-remixer-tidal-id": {
            type: String,
            default: ""
        },

        "album-remixer-deezer-id": {
            type: String,
            default: ""
        },

        "album-remixer-audiomack-id": {
            type: String,
            default: ""
        },

        "secondary-language-album-featured-artist": {
            type: String,
            default: ""
        },

        "album-title": {
            type: String,
            default: ""
        },

        "album-subtitle": {
            type: String,
            default: ""
        },

        "secondary-language-album-title": {
            type: String,
            default: ""
        },

        "secondary-language-album-subtitle": {
            type: String,
            default: ""
        },

        genre: {
            type: String,
            default: ""
        },

        "original-release-date": {
            type: String,
            default: ""
        },

        "release-date": {
            type: String,
            default: ""
        },

        "release-date-time": {
            type: String,
            default: ""
        },

        "release-date-timezone": {
            type: String,
            default: ""
        },

        "dsp-release-date-overrides-enabled": {
            type: String,
            default: ""
        },

        "dsp-release-date-overrides": {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        "pre-order": {
            type: String,
            default: ""
        },

        "pre-order-date": {
            type: String,
            default: ""
        },

        "pre-order-time": {
            type: String,
            default: ""
        },

        "pre-order-timezone": {
            type: String,
            default: ""
        },

        "cover-art-ai-disclosure": {
            type: String,
            default: ""
        },

        "youtube-eligibility-sounds-original": {
            type: String,
            default: ""
        },

        "youtube-eligibility-isrc-authorization": {
            type: String,
            default: ""
        },

        "youtube-eligibility-capitalization-notice": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-promo-services": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-sample-libraries": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-remix-reuse": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-public-domain": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-film-audio": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-youtube-audio": {
            type: String,
            default: ""
        },

        "youtube-eligibility-content-id-owner": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-other-content-id": {
            type: String,
            default: ""
        },

        "youtube-eligibility-youtube-consequences": {
            type: String,
            default: ""
        },

        "youtube-eligibility-worldwide-rights": {
            type: String,
            default: ""
        },

        "youtube-eligibility-no-name-misuse": {
            type: String,
            default: ""
        },

        "youtube-eligibility-terms-accepted": {
            type: String,
            default: ""
        },

        "legal-terms-accepted": {
            type: String,
            default: ""
        },

        "parental-advisory": {
            type: String,
            default: ""
        },

        "c-line": {
            type: String,
            default: ""
        },

        "p-line": {
            type: String,
            default: ""
        },

        "territory-availability": {
            type: String,
            default: "WW"
        },

        "album-srp": {
            type: Number,
            default: 0.99
        },

        "album-srp-currency": {
            type: String,
            default: "USD"
        },

        keywords: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        "page-name": {
            type: String,
            default: ""
        },

        "page-url": {
            type: String,
            default: ""
        },

        "page-user": {
            type: String,
            default: ""
        },

        "release-display-date": {
            type: String,
            default: ""
        },

        "track-listing-preview-date": {
            type: String,
            default: ""
        },

        "cover-art-preview-date": {
            type: String,
            default: ""
        },

        "pre-order-preview-date": {
            type: String,
            default: ""
        },

        "clip-preview-date": {
            type: String,
            default: ""
        },

        "effective-date": {
            type: String,
            default: ""
        },

        "disc-number": {
            type: Number,
            default: 1
        },

        "track-number": {
            type: Number,
            default: 1
        },

        "client-track-reference": {
            type: String,
            default: ""
        },

        "track-title": {
            type: String,
            default: ""
        },

        "track-subtitle": {
            type: String,
            default: ""
        },

        "secondary-language-track-title": {
            type: String,
            default: ""
        },

        "secondary-language-track-subtitle": {
            type: String,
            default: ""
        },

        "track-main-artist": {
            type: String,
            default: ""
        },

        "track-main-artist-spotify-id": {
            type: String,
            default: ""
        },

        "track-main-artist-apple-music-id": {
            type: String,
            default: ""
        },

        "track-main-artist-tidal-id": {
            type: String,
            default: ""
        },

        "track-main-artist-deezer-id": {
            type: String,
            default: ""
        },

        "track-main-artist-audiomack-id": {
            type: String,
            default: ""
        },

        "secondary-language-track-main-artist": {
            type: String,
            default: ""
        },

        "track-featured-artist": {
            type: [creditSchema],
            default: []
        },

        "track-featured-artist-spotify-id": {
            type: String,
            default: ""
        },

        "track-featured-artist-apple-music-id": {
            type: String,
            default: ""
        },

        "track-featured-artist-tidal-id": {
            type: String,
            default: ""
        },

        "track-featured-artist-deezer-id": {
            type: String,
            default: ""
        },

        "track-featured-artist-audiomack-id": {
            type: String,
            default: ""
        },

        "track-with-artist": {
            type: [creditSchema],
            default: []
        },

        "track-with-artist-spotify-id": {
            type: String,
            default: ""
        },

        "track-with-artist-apple-music-id": {
            type: String,
            default: ""
        },

        "track-with-artist-tidal-id": {
            type: String,
            default: ""
        },

        "track-with-artist-deezer-id": {
            type: String,
            default: ""
        },

        "track-with-artist-audiomack-id": {
            type: String,
            default: ""
        },

        "track-remixer-artist": {
            type: [creditSchema],
            default: []
        },

        "remixer-spotify-id": {
            type: String,
            default: ""
        },

        "remixer-apple-music-id": {
            type: String,
            default: ""
        },

        "remixer-tidal-id": {
            type: String,
            default: ""
        },

        "remixer-deezer-id": {
            type: String,
            default: ""
        },

        "remixer-audiomack-id": {
            type: String,
            default: ""
        },

        "secondary-language-track-featured-artist": {
            type: String,
            default: ""
        },

        "track-audio-language": {
            type: String,
            default: ""
        },

        "language-of-performance": {
            type: String,
            default: ""
        },

        "country-of-recording": {
            type: String,
            default: ""
        },

        "year-of-recording": {
            type: String,
            default: ""
        },

        "track-length": {
            type: String,
            default: ""
        },

        "isrc-code": {
            type: String,
            default: ""
        },

        "video-isrc-code": {
            type: String,
            default: ""
        },

        "iswc-code": {
            type: String,
            default: ""
        },

        "track-release-id": {
            type: String,
            default: ""
        },

        "spotify-track-id": {
            type: String,
            default: ""
        },

        "apple-music-track-id": {
            type: String,
            default: ""
        },

        "mix-version": {
            type: String,
            default: ""
        },

        "composition-type": {
            type: String,
            default: ""
        },

        "instrumental-source": {
            type: String,
            default: ""
        },

        "instrumental-license-files": {
            type: String,
            default: ""
        },

        "samples-used": {
            type: String,
            default: ""
        },

        "sample-clearance-files": {
            type: String,
            default: ""
        },

        "cover-song-license-file": {
            type: String,
            default: ""
        },

        "publishing-split-sheet-available": {
            type: String,
            default: ""
        },

        "publishing-split-sheet-file": {
            type: String,
            default: ""
        },

        "copyright-registration-available": {
            type: String,
            default: ""
        },

        "copyright-registration-files": {
            type: String,
            default: ""
        },

        "work-for-hire-available": {
            type: String,
            default: ""
        },

        "work-for-hire-files": {
            type: String,
            default: ""
        },

        "work-for-hire-acknowledged": {
            type: String,
            default: ""
        },

        "work-for-hire-contributor-legal-name": {
            type: String,
            default: ""
        },

        "work-for-hire-contributor-professional-name": {
            type: String,
            default: ""
        },

        "work-for-hire-contributor-role": {
            type: String,
            default: ""
        },

        "work-for-hire-agreement-date": {
            type: String,
            default: ""
        },

        "work-for-hire-hiring-party": {
            type: String,
            default: ""
        },

        "work-for-hire-material-covered": {
            type: String,
            default: ""
        },

        "work-for-hire-notes": {
            type: String,
            default: ""
        },

        "custom-id": {
            type: String,
            default: ""
        },

        "youtube-description": {
            type: String,
            default: ""
        },

        "age-restriction": {
            type: String,
            default: ""
        },

        "clip-start-time": {
            type: String,
            default: ""
        },

        "clip-duration": {
            type: String,
            default: ""
        },

        "tiktok-clip-start-seconds": {
            type: String,
            default: ""
        },

        "tiktok-clip-duration-minutes": {
            type: String,
            default: ""
        },

        composer: {
            type: String,
            default: ""
        },

        lyricist: {
            type: String,
            default: ""
        },

        publisher: {
            type: String,
            default: ""
        },

        lyrics: {
            type: String,
            default: ""
        },

        "lyrics-available": {
            type: String,
            default: ""
        },

        "download-purchase": {
            type: String,
            default: ""
        },

        "subscription-streaming": {
            type: String,
            default: ""
        },

        "ad-supported-streaming": {
            type: String,
            default: ""
        },

        "performance-royalties": {
            type: String,
            default: ""
        },

        "track-srp": {
            type: Number,
            default: 0.99
        },

        "track-srp-currency": {
            type: String,
            default: "USD"
        },

        "selected-dsps": {
            type: String,
            default: ""
        },

        "delivery-action-type": {
            type: String,
            default: ""
        },

        performer: {
            type: String,
            default: ""
        },

        "track-performer-credits": {
            type: [creditSchema],
            default: []
        },

        "track-writer-credits": {
            type: [creditSchema],
            default: []
        },

        "track-additional-credits": {
            type: [creditSchema],
            default: []
        },

        "music-producer": {
            type: String,
            default: ""
        },

        "co-producer": {
            type: String,
            default: ""
        },

        "assistant-engineer": {
            type: String,
            default: ""
        },

        engineer: {
            type: String,
            default: ""
        },

        mixer: {
            type: String,
            default: ""
        },

        "mixing-engineer": {
            type: String,
            default: ""
        },

        "recording-engineer": {
            type: String,
            default: ""
        },

        "mastering-engineer": {
            type: String,
            default: ""
        },

        "graphic-design": {
            type: String,
            default: ""
        },

        "video-director": {
            type: String,
            default: ""
        },

        "video-producer": {
            type: String,
            default: ""
        },

        remixer: {
            type: String,
            default: ""
        },

        arranger: {
            type: String,
            default: ""
        },

        actor: {
            type: String,
            default: ""
        },

        "playback-singer": {
            type: String,
            default: ""
        },

        "film-director": {
            type: String,
            default: ""
        },

        "music-director": {
            type: String,
            default: ""
        },

        directors: {
            type: String,
            default: ""
        },

        producers: {
            type: String,
            default: ""
        },

        editors: {
            type: String,
            default: ""
        },

        crew: {
            type: String,
            default: ""
        },

        conductor: {
            type: String,
            default: ""
        },

        soloist: {
            type: String,
            default: ""
        },

        orchestra: {
            type: String,
            default: ""
        },

        "provided-by": {
            type: String,
            default: ""
        },

        "courtesy-line": {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const DpmMetaData =
    mongoose.models?.releaseMetaData ||
    mongoose.model("releaseMetaData", dpmCallBackSchema);

export default DpmMetaData;
