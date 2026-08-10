import User from "../models/userModel";
import sendEmail from "../sendMail/sendEmail";
import { subGracePeriodEmail } from "./functions";

export async function handleFailedPayment(data: any) {
    const email = data.customer.email;
    const now = new Date()
    const graceEndsAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const user = await User.findOne({ email });
     if (!user) return;

    await User.updateOne(
        { email },
        {
         $set: {
        premium: true, // unchanged — grace period keeps access
        "subscriptionDetails.subscriptionStatus": "GRACE_PERIOD",
        "subscriptionDetails.paymentStatus": "FAILED",
        "subscriptionDetails.failedAt": now,
        "subscriptionDetails.graceEndsAt": graceEndsAt,
      },
        },
    );

    await sendEmail(
    user.email,
    "We Couldn't Renew Your SoundMac Subscription",
    subGracePeriodEmail({
      customerName: user.firstName,
      renewalDate: now.toDateString(),
      graceEndsAt: graceEndsAt.toDateString(),
      dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
      support_email: process.env.SUPPORT_EMAIL!,
      company_name: process.env.COMPANY_NAME!,
      company_address: process.env.COMPANY_ADDRESS!,
    }),
  );
}
