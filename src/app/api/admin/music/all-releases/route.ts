import { AdminRelease } from "@/app/type";
import dbConnect from "@/util/db";
import { buildSort } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import { SortOrder } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    let releases: AdminRelease[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);

    let page = parseInt(searchParams.get("page") || "1", 10);
    const releaseType = searchParams.get("releaseType") || "single";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const sort = searchParams.get("sort") || "-createdAt";
    const releaseTitle = searchParams.get("releaseTitle");
    const artist = searchParams.get("artist");
    const releaseStatusFilter = searchParams.get("releaseStatusFilter");
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.

    let query: any = {};
    if (releaseStatusFilter && releaseStatusFilter !== "all") {
      query.releaseStatus = releaseStatusFilter;
    }
    if (artist && artist != "none") query.artistName = artist;
    if (releaseTitle?.trim()) {
      query = {
        ...query, $or: [
          { upc: releaseTitle },
          { releaseTitle: {$regex: `^${releaseTitle}`, $options: "i" }}]
      };

      // page = 1;
    }
    const singlesProjection = {
      releaseTitle: 1,
      artistName: 1,
      catalogNumber: 1,
      upc: 1,
      isrc: 1,
      releaseDate: 1,
      releaseStatus: 1,
      releaseImage: 1,
      genre: 1,
      featuredArtist: 1,
      songWriter: 1,
      producer: 1,

    };
    const albumProjection = {
      releaseTitle: 1,
      artistName: 1,
      catalogNumber: 1,
      upc: 1,
      isrc: 1,
      releaseDate: 1,
      releaseStatus: 1,
      releaseImage: 1,
    };
    // let exec = {};
    console.log("the queries", query);

    if (releaseType != "single") {
      releases = await AlbumModel.find(query, albumProjection)
        .collation({ locale: "en", strength: 2 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      totalCount = await AlbumModel.countDocuments(query);
    } else {
      releases = await SongModel.find(query, singlesProjection).populate("artist", "spotifyId appleId -_id")
        .collation({ locale: "en", strength: 2 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      // exec = await SongModel.find(query,projection)
      //   .collation({ locale: "en", strength: 2 })
      //   .sort({ createdAt: -1 })
      //   .skip((page - 1) * limit)
      //   .limit(limit)
      //   .explain("executionStats");
      totalCount = await SongModel.countDocuments(query);
    }
    // console.log("song filters", releaseStatusFilter);

    return NextResponse.json(
      {
        data: releases,
        page,
        // exec,
        // skip: (page - 1) * limit,
        // sort,
        limit,
        // hasNextPage: songs.length === limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No songs found",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 },
      );
    }
  }
}
