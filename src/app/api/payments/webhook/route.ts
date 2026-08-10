import { PaymentEmailData } from "@/app/type";
import dbConnect from "@/util/db";
import {
  handleChargeSuccess,
  // handleFailedPayment,
  handlePromotionSuccess,
  handleSubscriptionCardUpdate,
  handleSubscriptionCreate,
  handleSubscriptionDisabled,
  subCancelEmail,
  subSuccessEmail,
} from "@/util/middleware/functions";
import { handleFailedPayment } from "@/util/middleware/subcriptionFailedPayment";
import ChartRegistrationModel from "@/util/models/chartRegistrationModel";
import User from "@/util/models/userModel";
import UserNotification from "@/util/models/userNotification";
import sendEmail from "@/util/sendMail/sendEmail";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const header = await headers();
  const signature = header.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");

  if (hash !== signature)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(body);
  console.log("hhiukj", event);

  await dbConnect();

  try {
    if (event.event === "charge.success") {
      console.log("event received");

      if (event.data.metadata && event.data.metadata.isPromotion) {
        await handlePromotionSuccess(event.data);
        console.log("event handled");
      } else if (event.data.metadata && event.data.metadata.isChartRegistration) {
        console.log("chart registration payment successful");
        const user = await User.findOne({ email: event.data.metadata.email });
        await ChartRegistrationModel.findByIdAndUpdate(
          event.data.metadata.chartId,
          { $set: { chartStatus: "pending", transactionId: event.data.reference } }
        );
        if(user){
            await UserNotification.create({
              userId: user._id, 
              reason: "Chart Registration Submitted",
              message: `Your chart registration for "${event.data.metadata.releaseTitle}" has been submitted and is pending review.`,
              status: "delivered",
            });

        }
      } else {
        const user = await User.findOne({ email: event.data.customer.email });
        if (!user) return;
        await handleChargeSuccess(event.data);

        const support_email = process.env.SUPPORT_EMAIL!;
        const company_name = process.env.COMPANY_NAME!;
        const company_address = process.env.COMPANY_ADDRESS!;
        const frontendUrl = process.env.FRONTEND_URL;

        const paymentData: PaymentEmailData = {
          customerName: event.data.customer.first_name,
          customerEmail: event.data.customer.email,
          planName: event.data.plan.name,
          amount: (event.data.amount / 100).toString(),
          currency: "NGN",
          billingCycle: event.data.plan.interval,
          nextBillingDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toDateString(),
          transactionId: event.data.reference,
          support_email,
          company_address,
          company_name,
          dashboardUrl: frontendUrl + "/dashboard",
        };
        const html = subSuccessEmail(paymentData)

        await sendEmail(user.email, "subscription payment", html);
      }
    }

    if (event.event === "subscription.not_renew") {
      const user = await User.findOne({ email: event.data.customer.email });

      if (!user) return;

      user.subscriptionDetails.subscriptionStatus = event.data.status;
      await user.save();
      const support_email = process.env.SUPPORT_EMAIL!;
      const company_name = process.env.COMPANY_NAME!;
      const company_address = process.env.COMPANY_ADDRESS!;
      const frontendUrl = process.env.FRONTEND_URL;

      const paymentData: PaymentEmailData = {
        customerName: user.firstName,
        customerEmail: user.email,
        planName: event.data.plan.name,
        amount: (event.data.amount / 100).toString(),
        currency: "NGN",
        billingCycle: event.data.plan.interval,
        nextBillingDate: new Date(user.premiumExpiration || "").toDateString(),
        transactionId: event.data.reference,
        support_email,
        company_address,
        company_name,
        dashboardUrl: frontendUrl + "/dashboard",
      };
      const html = subCancelEmail(paymentData);

      await sendEmail(user.email, "subscription cancelled", html);
    }

    if (event.event === "invoice.payment_failed") {
      if (event.data.metadata && event.data.metadata.isPromotion) {
        // Handle promotion payment failure if needed
      } else if (event.data.metadata && event.data.metadata.isChartRegistration) {
        console.log("chart registration payment failed");
        await ChartRegistrationModel.findByIdAndUpdate(
          event.data.metadata.chartId,
          { $set: { chartStatus: "payment_failed", transactionId: event.data.reference } }
        );
      } else {
        await handleFailedPayment(event.data);
      }
    }

    if (event.event === "subscription.create") {
      await handleSubscriptionCreate(event.data);
    }

    if (event.event === "subscription.disable") {
      await handleSubscriptionDisabled(event.data);
    }

    if (event.event === "subscription.update") {
      await handleSubscriptionCardUpdate(event.data);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
