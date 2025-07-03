

export interface LOAD_MORE {
    loading: boolean,
    page: number,
    hasNextPage: boolean,
    setPage: (page: number) => void;
}