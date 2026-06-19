import mongoose from "mongoose";


const dpmCallBackSchema = new mongoose.Schema({
    label: {
        type: String,
        default: "Independent Artist",
        required: true
    },
    "release-type": { type: String, required: [true, "Release type is required"] },
    upc: { type: String, required: [true, "UPC is required"], index: true },
    "catalog-number": { type: String, required: [true, "Catalog number is required"], unique:true },
    "album-release-id": { type: String, required: [true, "Album release ID is required"] },
    "album-main-artist": { type: String, required: [true, "Album main artist is required"] },
    "secondary-language-album-main-artist": { type: String, default: "" },
    "album-featured-artist": { type: String, default: "" },
    "secondary-language-album-featured-artist": { type: String, default: "" },
    "album-title": { type: String, default: "" },
    "album-subtitle": { type: String, default: "" },
    "secondary-language-album-title": { type: String, default: "" },
    "secondary-language-album-subtitle": { type: String, default: "" },
    genre: { type: String, required: [true, "Genre is required"] },
    "release-date": { type: String, required: [true, "Release date is required"] },
    "release-date-time": { type: String, required: [true, "Release Time is required"], },
    "release-date-timezone": { type: String, required: [true, "Release Timezone is required"], },
    "parental-advisory": { type: String, default: "" },
    "c-line": { type: String, default: "" },
    "disc-number": { type: Number, required: [true, "Disc number is required"] },
    "track-number": { type: Number, required: [true, "Track number is required"] },
    "track-title": {
        type: String, required: [function (this: any) {
            return this.get("release-type") !== "Album";
        }, "Track title is required"]
    },
    "track-subtitle": { type: String, default: "" },
    "secondary-language-track-title": { type: String, default: "" },
    "secondary-language-track-subtitle": { type: String, default: "" },
    "track-main-artist": { type: String, default: "" },
    "secondary-language-track-main-artist": { type: String, default: "" },
    "track-featured-artist": { type: String, default: "" },
    "secondary-language-track-featured-artist": { type: String, default: "" },
    "language-of-performance": { type: String, required: [true, "Language of performance is required"] },
    "track-length": { type: String, default: "" },
    "isrc-code": { type: String, default: "" },
    "track-release-id": {
        type: String, required: [function (this: any) {
            return this.get("release-type") !== "Album";
        }, "Track release ID is required"]
    },
    "p-line": { type: String, required: [true, "P-line is required"] },
    "music-producer": { type: String, default: "" },
    "remixer": { type: String, default: "" },
    "ISWC-Code": { type: String, },
    composer: {
        type: String, required: [function (this: any) {
            return this.get("release-type") !== "Album";
        }, "Composer is required"]
    },
    lyricist: {
        type: String, required: [function (this: any) {
            return this.get("release-type") !== "Album";
        }, "Lyricist is required"]
    },
    publisher: { type: String, default: "" },
    "territory-availability": { type: String, default: "WW", required: [true, "Territory availability is required"] }, // Default to worldwide availability
    "download-purchase": { type: String, default: "Y", required: [true, "Download Purchase is required"] },
    "subscription-streaming": { type: String, default: "Y", required: [true, "Subscription Streaming is required"] },
    "ad-supported-streaming": { type: String, default: "Y", required: [true, "Ad Supported Streaming is required"] },
    "album-srp": { type: Number, default: 0.99, required: [true, "Album SRP is required"] },
    "album-srp-currency": { type: String, default: "EUR", required: [true, "Album SRP currency is required"] },
    "track-srp": { type: Number, default: 0.99, required: [true, "Track SRP is required"] },
    "track-srp-currency": { type: String, default: "EUR", required: [true, "Track SRP currency is required"] },
    actor: { type: String, default: "" },
    "playback-singer": { type: String, default: "" },
    "film-director": { type: String, default: "" },
    "music-director": { type: String, default: "" },
    "page-name": { type: String, default: "" },
    "page-url": { type: String, default: "" },
    "page-user": { type: String, default: "" },
    keywords: { type: String, default: "" },
    description: { type: String, default: "" },
    "album-main-artist-id": { type: String, default: "" },
    "track-main-artist-id": { type: String, default: "" },
    "clip-start-time": { type: String, default: "" },
    "clip-duration": { type: String, default: "" },
    "effective-date": { type: String, default: "" }
});

const DpmMetaData = mongoose.models?.releaseMetaData || mongoose.model('releaseMetaData', dpmCallBackSchema);

export default DpmMetaData;