import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, plan } = await req.json();
    // console.log(email,plan);
    
    if (!email || !plan)
      return NextResponse.json({ msg: "Missing fields" }, { status: 400 });

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ msg: "Invalid request" }, { status: 404 });

    let planCode = null;
    switch (plan) {
      case "Emerging_Artist":
        planCode = process.env.Emerging_Artist
        break;
      case "Independent_Artist":
        planCode = process.env.Independent_Artist
        break;
      case "Indie_Label":
        planCode = process.env.Indie_Label
        break;
      case "Major_Label":
        planCode = process.env.Major_Label
        break;
    
      default:
        planCode = null;
        break;
    }

    if(!planCode){
      return NextResponse.json({ msg: "Plan is required." }, { status: 400 });
    }

    const res = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email:email,
          amount:100000,
          plan: planCode,
          // channels:["card", "bank", "apple_pay", "ussd", "qr", "mobile_money", "bank_transfer"],
          channels:["card", "bank", "ussd"],
          metadata: { email:email ,first_name:user.firstName,last_name:user.lastName}
        })
      }
    );
    // console.log(res);
    

    const data = await res.json();
// console.log(data);

    if (!data.status)
      return NextResponse.json({ error: data.message }, { status: 400 });

    return NextResponse.json({
      url: data.data.authorization_url
    });
  } catch (err) {
    console.error("payment error",err);
    return NextResponse.json(
      { msg: "Payment initialization failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { reference } = await req.json();
    // console.log(email,plan);
    
    if (!reference)
      return NextResponse.json({ msg: "Missing fields" }, { status: 400 });

    const res = await fetch(
      "https://api.paystack.co/transaction/verify/"+reference,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    

    const data = await res.json();

    if (!data.status)
      return NextResponse.json({ msg: data.message }, { status: 400 });

    return NextResponse.json({
      msg: data.message
    });
  } catch (err) {
    console.error("jjjj",err);
    return NextResponse.json(
      { msg: "Payment verification failed" },
      { status: 500 }
    );
  }
}
