import dbConnect from "@/util/db";
import User, { IUser } from "@/util/models/userModel";
import { inngest } from "../inngest";
import { subExpiredEmail, subGracePeriodEmail } from "@/util/middleware/functions";
import sendEmail from "@/util/sendMail/sendEmail";
import UserNotification from "@/util/models/userNotification";

export const subscriptionExpirySweep = inngest.createFunction(
  { id: "subscription-expiry-sweep", triggers: { cron: "0 10 * * *" } }, // daily, after the reminder job

  async ({ step }) => {
    await step.run("connect-db", async () => dbConnect());
    const now = new Date();

    // Pass 1 — GRACE_PERIOD users whose window has run out: expire them
    const graceExpired = await step.run("fetch-grace-expired", async () => {
      const users = await User.find({
        "subscriptionDetails.subscriptionStatus": "GRACE_PERIOD",
        "subscriptionDetails.graceEndsAt": { $lte: now },
      }).lean<IUser[]>();

      return users.map((u) => ({
        _id: u._id.toString(),
        firstName: u.firstName,
        email: u.email,
      }));
    });

    for (const user of graceExpired) {
      await step.run(`expire-grace-${user._id}`, async () => {
        await User.findByIdAndUpdate(user._id, {
          premium: false,
          premiumExpiration: null,
          "subscriptionDetails.subscriptionStatus": "EXPIRED",
          "subscriptionDetails.paymentStatus": "EXPIRED",
        });
        await sendEmail(
          user.email,
          "Your SoundMac Subscription Has Expired",
          subExpiredEmail({
            customerName: user.firstName,
            renewalDate: new Date().toDateString(), 
            dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
            support_email: process.env.SUPPORT_EMAIL!,
            company_name: process.env.COMPANY_NAME!,
            company_address: process.env.COMPANY_ADDRESS!,
          }),
        );

        await UserNotification.create({
  userId: user._id,
  reason: "Subscription Expired",
  message: "Your premium subscription has expired. Subscribe again to continue distributing your music.",
  status: "delivered",
});
      });
    }

    // Pass 2 — ACTIVE, non-card users whose expiration already passed with no webhook to catch them
    const uncaughtExpirations = await step.run(
      "fetch-uncaught-expirations",
      async () => {
        const users = await User.find({
          premium: true,
          "subscriptionDetails.subscriptionStatus": "ACTIVE",
          "subscriptionDetails.paymentMethod": "other",
          premiumExpiration: { $lte: now },
        }).lean<IUser[]>();

        return users.map((u) => ({
          _id: u._id.toString(),
          firstName: u.firstName,
          email: u.email,
        }));
      },
    );

    for (const user of uncaughtExpirations) {
      await step.run(`start-grace-${user._id}`, async () => {
        const graceEndsAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        await User.findByIdAndUpdate(user._id, {
          "subscriptionDetails.subscriptionStatus": "GRACE_PERIOD",
          "subscriptionDetails.paymentStatus": "FAILED",
          "subscriptionDetails.failedAt": now,
          "subscriptionDetails.graceEndsAt": graceEndsAt,
        });

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
      });
    }

    // Pass 3 — CANCELLED users whose access period has run out
    const cancelledExpired = await step.run(
      "fetch-cancelled-expired",
      async () => {
        const users = await User.find({
          "subscriptionDetails.subscriptionStatus": "CANCELLED",
          premiumExpiration: { $lte: now },
        }).lean<IUser[]>();

        return users.map((u) => ({
          _id: u._id.toString(),
          firstName: u.firstName,
          email: u.email,
        }));
      },
    );

    for (const user of cancelledExpired) {
      await step.run(`expire-cancelled-${user._id}`, async () => {
        await User.findByIdAndUpdate(user._id, {
          premium: false,
          premiumExpiration: null,
          "subscriptionDetails.subscriptionStatus": "EXPIRED",
          "subscriptionDetails.paymentStatus": "EXPIRED",
        });
        await sendEmail(
          user.email,
          "Your SoundMac Subscription Has Expired",
          subExpiredEmail({
            customerName: user.firstName,
            renewalDate: new Date().toDateString(),
            dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
            support_email: process.env.SUPPORT_EMAIL!,
            company_name: process.env.COMPANY_NAME!,
            company_address: process.env.COMPANY_ADDRESS!,
          }),
        );
      });
    }

    return {
      graceExpired: graceExpired.length,
      pushedToGrace: uncaughtExpirations.length,
      cancelledExpired: cancelledExpired.length,
    };
  },
);
