/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client'
import UserRoute from "@/app/protectedRoute/protectedRoute";
import classes from './manage-artist.module.css'
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import UserContext from "@/app/context/userContext/userContext";
import InformationContext from "@/app/context/informationContext/informationContext";
import LoadMore from "@/app/components/loadMore/loadMoare";
import { ARTIST, PAGINATION } from "../types";

const url = process.env.NEXT_PUBLIC_APP_URL_VERSION_2

export default function ManageArtist() {
    const userContext = useContext(UserContext)
    const informationContext = useContext(InformationContext)

    const [fetchingArtist, setFetchingArtist] = useState(false)
    const [artist, setArtist] = useState<ARTIST[]>([])
    const [pagination, setPagination] = useState<PAGINATION | null>(null)
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState('created_at')

    const fetchArtist = async (pageNum = 1) => {
        const token = localStorage.getItem("token")
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }

        setFetchingArtist(true)
        try {
            const { data } = await axios.get(`${url}/artists?page=${pageNum}&sort=${sortBy}`, config);

            if (!pageNum || pageNum === 1) {
                setArtist(data?.data?.artists);
            } else {
                setArtist((prev) => [...prev, ...data.data?.artists]);
            }

            setPagination(data?.data?.pagination)
            informationContext?.addToast('success', 'Success!', data.message);

        } catch (error) {
            userContext?.handleAPIError(error);
        } finally {
            setFetchingArtist(false)
        }
    }

    useEffect(() => {
        fetchArtist(1);
    }, [sortBy]);

    const handleDelete = async (artistId: string) => {
        if (!confirm('Are you sure you want to delete this artist?')) return;

        const token = localStorage.getItem("token")
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }

        try {
            await axios.delete(`${url}/artists/${artistId}`, config);
            setArtist(prev => prev.filter(a => a._id !== artistId));
            informationContext?.addToast('success', 'Success!', 'Artist deleted successfully');
        } catch (error) {
            userContext?.handleAPIError(error);
        }
    }

    return (
        <UserRoute>
            <div className={classes.container}>
                {/* Header Section */}
                <div className={classes.controls}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={classes.sortSelect}
                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="updated_at">Sort by Last Updated</option>
                    </select>
                </div>

                {/* Artists Grid */}
                <div className={classes.artistsGrid}>
                    {artist.map((artistItem, index) => (
                        <div key={index} className={classes.artistCard}>
                            <div className={classes.artistImageContainer}>
                                {artistItem.artistImage ? (
                                    <img
                                        src={artistItem.artistImage}
                                        alt={artistItem.artistName}
                                        className={classes.artistImage}
                                    />
                                ) : (
                                    <div className={classes.noImage}>
                                        <svg
                                            className={classes.noImageIcon}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className={classes.artistInfo}>
                                <h3 className={classes.artistName}>{artistItem.artistName}</h3>
                                <p className={classes.artistMeta}>
                                    Created: {new Date(artistItem.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className={classes.artistActions}>
                                <button className={classes.editBtn}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    className={classes.deleteBtn}
                                    onClick={() => handleDelete(artistItem._id)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="3,6 5,6 21,6" />
                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!fetchingArtist && artist.length === 0 && (
                    <div className={classes.emptyState}>
                        <svg
                            className={classes.emptyIcon}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                        </svg>
                        <h3 className={classes.emptyTitle}>No Artists Found</h3>
                        <p className={classes.emptyText}>Start by creating your first artist</p>
                    </div>
                )}

                {/* Load More */}
                <LoadMore
                    loading={fetchingArtist}
                    hasNextPage={pagination?.hasNextPage || false}
                    page={page}
                    setPage={(newPage: number) => {
                        setPage(newPage);
                        fetchArtist(newPage);
                    }}
                />
            </div>
        </UserRoute>
    )
}