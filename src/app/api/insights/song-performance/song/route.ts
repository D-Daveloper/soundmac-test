// app/api/sales-report/route.ts or pages/api/sales-report.ts

import dbConnect from '@/util/db';
import { verifyJWT, verifyUser } from '@/util/middleware/verifyJwt';
import salesReport from '@/util/models/salesReportModel';
import User from '@/util/models/userModel';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        await dbConnect();

        const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!user) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        } else if (user.role != "user") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        console.log(searchParams);

        // Query parameters
        const artist = searchParams.get('artist');
        const songTitle = searchParams.get('songTitle');
        const contentType = searchParams.get('type'); // 'song' or 'album'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Build match stage for aggregation
        const matchStage: any = {
            user: user._id,
            onModel: "song"
        };

        if (artist && artist != "All") {
            matchStage.trackArtistsRaw = artist;
        }

        if (songTitle) {
            matchStage.trackTitle = { $regex: songTitle, $options: 'i' };
        }

        // if (contentType) {
        //     matchStage.onModel = contentType;
        // }

        const results = await salesReport.aggregate([
            // Filter by user and search
            { $match: matchStage },

            // Group by song (upc/isrc)
            {
                $group: {
                    _id: {
                        upc: '$upc',
                        isrc: '$isrc',
                        trackTitle: '$trackTitle'
                    },
                    // // Sum all quantities for this song
                    // totalQuantity: {
                    //     $sum: { $toDouble: '$quantity' }
                    // },
                    totalDownloads: {
                        $sum: {
                            $cond: {
                                if: {
                                    $regexMatch: {
                                        input: '$dsp',
                                        regex: 'itunes',
                                        options: 'i'
                                    }
                                },
                                then: { $toDouble: '$quantity' }, // If true, add to downloads
                                else: 0                          // If false, add nothing
                            }
                        }
                    },
                    // 2. COUNT AS STREAMS (if DSP is anything else)
                    totalStreams: {
                        $sum: {
                            $cond: {
                                if: {
                                    $regexMatch: {
                                        input: '$dsp',
                                        regex: 'audiomack|boomplay|deezer|Apple Music|Spotify|pandora|SoundCloud|beatsource|netease|YouTube|tidal',
                                        options: 'i'
                                    }
                                },
                                then:{ $toDouble: '$quantity' }, // If true, add to streams,                        
                                else: 0  // If false, skip
                            }
                        }
                    },
                    // 2. COUNT AS STREAMS (if DSP is anything else)
                    totalLikes: {
                        $sum: {
                            $cond: {
                                if: {
                                    $regexMatch: {
                                        input: '$dsp',
                                        regex: 'snapchat|meta|bytedance',
                                        options: 'i'
                                    }
                                },
                                then:{ $toDouble: '$quantity' }, // If true, add to streams,                        
                                else: 0  // If false, skip
                            }
                        }
                    },
                    // Keep first occurrence data
                    trackTitle: { $first: '$trackTitle' },
                    trackArtists: { $first: '$trackArtistsRaw' },
                    releaseDate: { $first: '$saleMonth' },
                    upc: { $first: '$upc' },
                    isrc: { $first: '$isrc' }
                }
            },

            // Lookup/populate song details from Song collection
            {
                $lookup: {
                    from: 'songs', // Your song collection name
                    localField: 'upc',
                    foreignField: 'upc',
                    as: 'songDetails'
                }
            },

            // Unwind song details
            {
                $unwind: {
                    path: '$songDetails',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Project final shape
            {
                $project: {
                    _id: 0,
                    trackTitle: 1,
                    trackArtists: 1,
                    releaseDate: 1,
                    totalStreams: 1,
                    totalDownloads: 1,
                    totalLikes: 1,
                    upc: 1,
                    isrc: 1,
                    releaseImage: '$songDetails.releaseImage', // Adjust field name as needed
                    songId: '$songDetails._id',
                    featuredArtist: '$songDetails.featuredArtist'
                }
            },

            // Sort by quantity
            { $sort: { totalQuantity: -1 } },
            // Pagination
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);
        // Get total count for pagination
        const countPipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        upc: '$upc',
                        isrc: '$isrc',
                        trackTitle: '$trackTitle'
                    }
                }
            },
            { $count: 'total' }
        ];
        const countResult = await salesReport.aggregate(countPipeline);
        const totalCount = countResult[0]?.total || 0;
        return NextResponse.json({
            success: true,
            data: results,
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        });

    } catch (error) {
        console.error('Sales report API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sales report' },
            { status: 500 }
        );
    }
}