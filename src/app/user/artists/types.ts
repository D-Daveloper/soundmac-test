

export type SELECTED_IMAGE = string | null | ArrayBuffer

export interface ARTIST {
    _id: string
    artistName: string
    artistImage: string
    createdAt: Date
}

export interface PAGINATION {
    page: number
    skip: number
    sort: string
    limit: number
    hasNextPage: boolean
    totalCount: number
}