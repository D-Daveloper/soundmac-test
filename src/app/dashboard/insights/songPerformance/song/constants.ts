import { FeaturedArtist } from "@/app/type"

export type songPerformanceData = {
    totalStreams: number,
    totalDownloads: number,
    totalLikes: number,
    trackTitle: string
    trackArtists: string
    releaseDate: string
    upc: string
    isrc: string
    releaseImage: string
    songId: string
    featuredArtist: FeaturedArtist[]
}