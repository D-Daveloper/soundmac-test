import {
  boomplayPackages,
  deezerPackages,
  onlinePressPackages,
  promotionCategory,
  radioPromotionPackages,
  shazamPackages,
} from "@/app/constant";
import { albumFromApi, songFromApi, TrackFromApi } from "@/app/type";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import {
  extractAmount,
  parsePromotionFormData,
  uploadImage,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import Promotion, { IPromotion } from "@/util/models/promotionModel";
import SongModel from "@/util/models/songModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // console.log({ ...formData });

    const payload = parsePromotionFormData(formData);
    const {
      artist,
      releaseTitle,
      releaseDescription,
      promotionPackage,
      promotionType,
      promotionImage,
      priority,
      configuration,
      typeOfRelease,
      editorialTeams,
      marketingDetail,
      artistGender,
      location,
      releaseTime,
      subgenres,
      moods,
      comment,
      facebookProfileLink,
      instagramProfileLink,
      twitterProfileLink,
      youtubeProfileLink,
      tiktokProfileLink,
      focusTrack,
      country,
    } = payload;

    await dbConnect();
    let userArtist = null;
    let userSong: songFromApi | null = null;
    let userAlbum: albumFromApi | null = null;
    let userTrack: TrackFromApi | null = null;
    let Uploaderror: { msg: string; status: number } | null = null;
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 401 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    } else if (
      artist == null ||
      releaseTitle == null ||
      promotionType == null
    ) {
      Uploaderror = { msg: "Please provide all required fields", status: 400 };
    } else if (
      (priority == null || editorialTeams == null || marketingDetail == null) &&
      promotionType === promotionCategory.playlistPitch
    ) {
      Uploaderror = { msg: "Please provide all required fields", status: 400 };
    } else if (
      releaseDescription == null &&
      promotionType != promotionCategory.playlistPitch
    ) {
      Uploaderror = { msg: "Please provide all required fields", status: 400 };
    } else if (typeof artist != "string") {
      Uploaderror = { msg: "Artist must be a string", status: 400 };
    } else if (
      (!promotionImage || !(promotionImage instanceof File)) &&
      promotionType === promotionCategory.onlinePress
    ) {
      Uploaderror = { msg: "Promotion image is required", status: 400 };
    } else if (typeof releaseTitle != "string") {
      Uploaderror = { msg: "Release title must be a string", status: 400 };
    } else if (releaseDescription && typeof releaseDescription != "string") {
      Uploaderror = {
        msg: "Release description must be a string",
        status: 400,
      };
    } else if (promotionPackage && typeof promotionPackage != "string") {
      Uploaderror = { msg: "Promotion package must be a string", status: 400 };
    } else if (
      typeof promotionType != "string" ||
      ![
        "Online-Press",
        "Playlist-Pitch",
        "Radio-Promotion",
        "Shazam",
        "Deezer",
        "Boomplay",
      ].includes(promotionType)
    ) {
      Uploaderror = { msg: "Invalid Promotion Type", status: 400 };
    } else {
      userArtist = (await Artist.findOne({
        user: userJwt.user,
        artistName: (artist as string)?.trim(),
      })) as any;
      userSong = await SongModel.findOne({
        releaseTitle: (releaseTitle as string)?.trim(),
        user: userJwt.user,
      });
      userAlbum = await AlbumModel.findOne({
        releaseTitle: (releaseTitle as string)?.trim(),
        user: userJwt.user,
      });
      userTrack = await TrackModel.findOne({
        releaseTitle: (focusTrack as string)?.trim(),
        user: userJwt.user,
      });
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    } else if (!userAlbum && !userSong) {
      return NextResponse.json(
        { msg: "Invalid Release Title." },
        { status: 400 },
      );
    } else if (userAlbum && !userTrack) {
      return NextResponse.json({ msg: "Invalid Track." }, { status: 400 });
    }

    switch (promotionType) {
      case "Boomplay":
        if (!boomplayPackages.includes(promotionPackage!)) {
          return NextResponse.json(
            { msg: "Invalid Boomplay Package" },
            { status: 400 },
          );
        }
        break;
      case "Deezer":
        if (!deezerPackages.includes(promotionPackage!)) {
          return NextResponse.json(
            { msg: "Invalid Deezer Package" },
            { status: 400 },
          );
        }
        break;
      case "Online-Press":
        if (!onlinePressPackages.includes(promotionPackage!)) {
          return NextResponse.json(
            { msg: "Invalid Online Press Package" },
            { status: 400 },
          );
        }
        break;
      case "Shazam":
        if (!shazamPackages.includes(promotionPackage!)) {
          return NextResponse.json(
            { msg: "Invalid Shazam Package" },
            { status: 400 },
          );
        }
        break;
      case "Radio-Promotion":
        if (!radioPromotionPackages.includes(promotionPackage!)) {
          return NextResponse.json(
            { msg: "Invalid Radio Promotion Package" },
            { status: 400 },
          );
        }
        break;
      case "Playlist-Pitch":
        break;

      default:
        return NextResponse.json(
          { msg: "Invalid Pr5omotion Type" },
          { status: 400 },
        );
        break;
    }

    let imageUrl: { error: string | null; coverUrl: string | null } = {
      coverUrl: null,
      error: "Failed to upload image",
    };
    if (
      promotionType === promotionCategory.onlinePress ||
      (promotionType === promotionCategory.playlistPitch && promotionImage)
    ) {
      try {
        const buffer = Buffer.from(await promotionImage!.arrayBuffer());
        // ---- Resize to distributor standard ----
        const resized = await sharp(buffer)
          .resize(3000, 3000, { fit: "cover" })
          .jpeg({ quality: 90 })
          .toBuffer(); //resize the image for dpm
        console.log("buffer", resized);

        const imageType = promotionImage!.type.split("/")[1]; //get the image extension

        const imageStorageLocation = `$${promotionType}/${user!.email}/${userArtist.artistName}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension

        imageUrl = await uploadImage(
          imageType,
          resized as Buffer<ArrayBuffer>,
          imageStorageLocation,
        ); //send image to aws
        console.log(imageUrl);

        if (imageUrl.coverUrl == null) {
          return NextResponse.json({ msg: imageUrl.error }, { status: 400 });
        }
      } catch (error) {
        console.log("upload image error", error);
      }
    }
    const new_reference = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`; // generate a unique transaction reference for this promotion.

    if (promotionType === promotionCategory.playlistPitch) {
      try {
        await Promotion.create({
          transactionReference: new_reference,
          user: user!._id,
          amount: 0,
          isActive: true,
          releaseTitle,
          releaseDescription: "Playlist Pitch",
          artistName: userArtist.artistName,
          artist: userArtist._id,
          packageName: "Editorial Playlist Pitch",
          category: promotionType,
          promotionImage: imageUrl?.coverUrl,
          startDate: new Date(),
          endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          pitchPlayListDetails: {
            priority,
            label: user!.type,
            releaseDate: userAlbum?.releaseDate || userSong?.releaseDate,
            upc: userAlbum?.upc || userSong?.upc,
            featuredArtist:
              userTrack?.featuredArtist || userSong?.featuredArtist,
            trackLanguage:
              userAlbum?.releaseLanguage || userSong?.releaseLanguage,
            focusTrack: userAlbum ? userTrack?.releaseTitle : "",
            focusTrackIsrc: userAlbum ? userTrack?.isrc : userSong?.isrc,
            genre: userAlbum?.genre || userSong?.genre,
            country: country ? country : "",
            configuration: userAlbum ? "album" : "single",
            typeOfRelease: typeOfRelease ? typeOfRelease : "",
            editorialTeams,
            marketingDetail,
            artistGender: artistGender ? artistGender : "",
            location: location ? location : "",
            releaseTime: releaseTime ? releaseTime : "",
            subgenres: subgenres ? subgenres : [""],
            mood: moods ? moods : "",
            comment: comment ? comment : "",
            facebookProfileLink: facebookProfileLink ? facebookProfileLink : "",
            instagramProfileLink: instagramProfileLink
              ? instagramProfileLink
              : "",
            twitterProfileLink: twitterProfileLink ? twitterProfileLink : "",
            youtubeProfileLink: youtubeProfileLink ? youtubeProfileLink : "",
            tiktokProfileLink: tiktokProfileLink ? tiktokProfileLink : "",
          },
        });

        return NextResponse.json({
          msg: "Your pitch has been submitted.",
        });
      } catch (error) {
        return handleMongooseValidationError(error);
      }
    }

    const amount = extractAmount(promotionPackage!);

    if (amount === null) {
      return NextResponse.json(
        { msg: "Invalid Promotion package" },
        { status: 400 },
      );
    }
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user!.email,
        amount: amount * 100,
        callback_url: `${process.env.FRONTEND_URL}/dashboard/promotion/payment-callback`,
        // channels:["card", "bank", "apple_pay", "ussd", "qr", "mobile_money", "bank_transfer"],
        channels: ["card", "bank", "ussd"],
        reference: new_reference,
        metadata: {
          email: user!.email,
          first_name: user!.firstName,
          last_name: user!.lastName,
          artistName: artist,
          artistId: userArtist._id.toString(),
          releaseTitle,
          releaseDescription,
          promotionPackage,
          promotionType,
          promotionImage: imageUrl.coverUrl,
          isPromotion: true,
          transactionReference: new_reference,
        },
      }),
    });

    const data = await res.json();
    console.log(data);

    if (!data.status)
      return NextResponse.json({ error: data.message }, { status: 400 });

    return NextResponse.json({
      url: data.data.authorization_url,
      msg: "You're getting redirected to the payment gateway.",
    });
  } catch (err) {
    console.error("payment error", err);
    return NextResponse.json(
      { msg: "Payment initialization failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { promotionId } = await req.json();

    await dbConnect();
    let promotion = null;
    let userSong = null;
    let userAlbum = null;
    let userArtist = null;
    let Uploaderror: { msg: string; status: number } | null = null;
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 401 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    } else if (!promotionId || !Types.ObjectId.isValid(promotionId)) {
      Uploaderror = {
        msg: "Promotion ID must be a valid ObjectId",
        status: 400,
      };
    } else {
      promotion = await Promotion.findById(promotionId);
    }
    if (!promotion) {
      Uploaderror = { msg: "Promotion not found", status: 404 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }
    if (
      promotion!.artist == null ||
      promotion!.releaseTitle == null ||
      promotion!.releaseDescription == null ||
      promotion!.packageName == null ||
      promotion!.category == null
    ) {
      Uploaderror = { msg: "Please provide all required fields", status: 400 };
    } else if (typeof promotion!.artistName != "string") {
      Uploaderror = { msg: "Artist must be a string", status: 400 };
    } else if (typeof promotion!.releaseTitle != "string") {
      Uploaderror = { msg: "Release title must be a string", status: 400 };
    } else if (typeof promotion!.releaseDescription != "string") {
      Uploaderror = {
        msg: "Release description must be a string",
        status: 400,
      };
    } else if (typeof promotion!.packageName != "string") {
      Uploaderror = { msg: "Promotion package must be a string", status: 400 };
    } else if (
      typeof promotion!.category != "string" ||
      ![
        "Online-Press",
        "Playlist-Pitch",
        "Radio-Promotion",
        "Shazam",
        "Deezer",
        "Boomplay",
      ].includes(promotion!.category)
    ) {
      Uploaderror = { msg: "Promotion type must be a string", status: 400 };
    } else {
      userArtist = (await Artist.findOne({
        user: userJwt.user,
        artistName: promotion!.artistName?.trim(),
      })) as any;
      userSong = await SongModel.findOne({
        release: promotion!.releaseTitle?.trim(),
        user: userJwt.user,
      });
      userAlbum = await AlbumModel.findOne({
        release: promotion!.releaseTitle?.trim(),
        user: userJwt.user,
      });
    }

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    switch (promotion!.category) {
      case "Boomplay":
        if (!boomplayPackages.includes(promotion!.packageName)) {
          return NextResponse.json(
            { msg: "Invalid Boomplay Package" },
            { status: 400 },
          );
        }
        break;
      case "Deezer":
        if (!deezerPackages.includes(promotion!.packageName)) {
          return NextResponse.json(
            { msg: "Invalid Deezer Package" },
            { status: 400 },
          );
        }
        break;
      case "Online-Press":
        if (!onlinePressPackages.includes(promotion!.packageName)) {
          return NextResponse.json(
            { msg: "Invalid Online Press Package" },
            { status: 400 },
          );
        }
      case "Shazam":
        if (!shazamPackages.includes(promotion!.packageName)) {
          return NextResponse.json(
            { msg: "Invalid Shazam Package" },
            { status: 400 },
          );
        }
        break;
      case "Radio-Promotion":
        if (!radioPromotionPackages.includes(promotion!.packageName)) {
          return NextResponse.json(
            { msg: "Invalid Radio Promotion Package" },
            { status: 400 },
          );
        }
        break;

      default:
        return NextResponse.json(
          { msg: "Invalid Pr5omotion Type" },
          { status: 400 },
        );
        break;
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    }

    // const reference = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}` // generate a unique transaction reference for this promotion.

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user!.email,
        amount: parseInt(promotion!.amount, 10) * 100,
        callback_url: `${process.env.FRONTEND_URL}/dashboard/promotion/payment-callback`,
        channels: ["card", "bank", "ussd"],
        // reference: reference, // use the generated unique transaction reference
        metadata: {
          email: user!.email,
          first_name: user!.firstName,
          last_name: user!.lastName,
          artistName: promotion?.artistName,
          artistId: promotion?.artist.toString(),
          releaseTitle: promotion?.releaseTitle,
          releaseDescription: promotion?.releaseDescription,
          promotionPackage: promotion?.packageName,
          promotionType: promotion?.category,
          isPromotion: true,
          transactionReference: promotion!.transactionReference,
        },
      }),
    });

    const data = await res.json();
    console.log(data);

    if (!data.status)
      return NextResponse.json({ error: data.message }, { status: 400 });

    return NextResponse.json({
      url: data.data.authorization_url,
      msg: "You're getting redirected to the payment gateway.",
    });
  } catch (err) {
    console.error("payment error", err);
    return NextResponse.json(
      { msg: "Payment initialization failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { reference } = await req.json();
    // console.log(email,plan);

    if (!reference)
      return NextResponse.json({ msg: "Missing fields" }, { status: 400 });

    const res = await fetch(
      "https://api.paystack.co/transaction/verify/" + reference,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await res.json();

    if (!data.status)
      return NextResponse.json({ msg: data.message }, { status: 400 });

    return NextResponse.json({
      msg: data.message,
    });
  } catch (err) {
    console.error("jjjj", err);
    return NextResponse.json(
      { msg: "Payment verification failed" },
      { status: 500 },
    );
  }
}

const limit = parseInt("4", 10);

export async function GET(req: Request) {
  try {
    let promotions: IPromotion[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    // const sort = searchParams.get("sort") || "createdAt";
    // const songTitle = searchParams.get("songTitle");
    // const artist = searchParams.get("artist");
    // const songStatusFilter = searchParams.get("songStatusFilter");
    // const sortQuery = buildSort(sort) as {
    //   [key: string]: SortOrder | { $meta: any };
    // }; //this is use to format the sort query for mongodb.

    const query: any = {
      user: userJwt.user,
    };
    // if (songStatusFilter && songStatusFilter !== "all") {
    //   query.releaseStatus = songStatusFilter;
    // }
    // if (artist) query.artistName = artist;
    // if (songTitle?.trim()) {
    //   query.releaseTitle = { $regex: `^${songTitle}`, $options: "i" };
    // }

    promotions = await Promotion.find(query)
      .collation({ locale: "en", strength: 2 })
      // .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);
    totalCount = await Promotion.countDocuments(query);
    // console.log("song filters", songStatusFilter);
    // console.log(promotions);

    return NextResponse.json(
      {
        data: promotions,
        page,
        // skip: (page - 1) * limit,
        // sort,
        // limit,
        // hasNextPage: songs.length === limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No Promotion found",
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
