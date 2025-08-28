import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import User from "../../../lib/models/userModel";
import {verifyJWT, verifyUser} from "@/app/lib/middleware/verifyJwt";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userData = await verifyJWT(req);
    
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }


    const user = userJwt.user ? await User.findById(userJwt.user) : null;

    if (!user) {
      return NextResponse.json({ msg: "User Not Found" }, { status: 401 });
    };
    
    return NextResponse.json({ msg: "Successful" ,user});
  } catch (error: unknown) {
    if (error instanceof Error){
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }else{
      return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
    }
  }
}
