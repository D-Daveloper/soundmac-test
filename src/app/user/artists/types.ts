

export type SELECTED_IMAGE = string | null | ArrayBuffer

export interface ARTIST {
    _id: string
    artistName: string
    artistImage: string
    createdAt: Date
    appleId: string
    spotifyId: string
}

export interface PAGINATION {
    page: number
    skip: number
    sort: string
    limit: number
    hasNextPage: boolean
    totalCount: number
}

export interface ARTIST_TABLE extends ARTIST {
    lastRoyalty:number;
    totalRoyalty:number;
    totalTracks:number;
    totalReleases:number;

}