import { inngest } from "../inngest";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import type { IUser } from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import UserNotification from "@/util/models/userNotification";
import { subRenewalReminderEmail } from "@/util/middleware/functions";

export const subscriptionRenewalReminder = inngest.createFunction(
  { id: "subscription-renewal-reminder", triggers: { cron: "0 9 * * *" } }, // daily at 9am

  async ({ step }) => {
    await step.run("connect-db", async () => {
      await dbConnect();
    });

    const now = new Date();
    const reminderWindowEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days out

    const usersDueForReminder = await step.run("fetch-users-due", async () => {
      const users = await User.find({
        premium: true,
        "subscriptionDetails.subscriptionStatus": "ACTIVE", // skip GRACE_PERIOD/CANCELLED users — they get different emails
        premiumExpiration: { $gte: now, $lte: reminderWindowEnd },
        "subscriptionDetails.renewalReminderSentAt": null,
      }).lean<IUser[]>();

     return users.map((u) => ({
    _id: u._id.toString(),
    firstName: u.firstName,
    email: u.email,
    premiumExpiration: u.premiumExpiration
      ? u.premiumExpiration.toISOString()
      : null,
  }));
});

    for (const user of usersDueForReminder) {
      await step.run(`send-reminder-${user._id}`, async () => {

        await sendEmail(
        user.email,
        "Your SoundMac Subscription Is Almost Due for Renewal",
        subRenewalReminderEmail({
            customerName: user.firstName,
            renewalDate: new Date(user.premiumExpiration!).toDateString(),
            dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
            support_email: process.env.SUPPORT_EMAIL!,
            company_name: process.env.COMPANY_NAME!,
            company_address: process.env.COMPANY_ADDRESS!,
        }),
        );

        await UserNotification.create({
          userId: user._id,
          reason: "Subscription Renewal",
          message: `Your subscription is renewing soon on ${new Date(user.premiumExpiration!).toDateString()}.`,
          status: "delivered",
        });

        await User.findByIdAndUpdate(user._id, {
          "subscriptionDetails.renewalReminderSentAt": new Date(),
        });
      });
    }

    return { remindersSent: usersDueForReminder.length };
  },
);






// import { inngest } from "../inngest";
// import dbConnect from "@/util/db";
// import User from "@/util/models/userModel";
// import type {IUser} from "@/util/models/userModel"
// import sendEmail from "@/util/sendMail/sendEmail";
// import UserNotification from "@/util/models/userNotification";

// export const subscriptionRenewalReminder = inngest.createFunction(
//   { id: "subscription-renewal-reminder", triggers: { cron: "0 9 * * *" } }, // daily at 9am

//   async ({ step }) => {
//     await step.run("connect-db", async () => {
//       await dbConnect();
//     });

//     const now = new Date();
//     const reminderWindowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days out

//     const usersDueForReminder = await step.run("fetch-users-due", async () => {
//       return User.find({
//         premium: true,
//         premiumExpiration: { $gte: now, $lte: reminderWindowEnd },
//         "subscriptionDetails.renewalReminderSentAt": null,
//       }).lean<IUser[]>();
//     });
    
  
      
//         for (const user of usersDueForReminder) {
//   await step.run(`send-reminder-${user._id}`, async () => {
//     await sendEmail(
//       user.email,
//       "Your SoundMac Subscription Is Almost Due for Renewal",
//       `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8" />
//           <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <title>Your SoundMac Subscription Is Almost Due for Renewal</title>
//         </head>
//         <body>
//           Hello ${user.firstName}, <br /><br />

//           Your SoundMac subscription will be renewing soon. <br /><br />

//           <strong>If you pay by card</strong> <br /><br />

//           There's nothing you need to do. Your subscription will renew automatically on your renewal date, so you'll continue enjoying uninterrupted access to your current plan, including distribution, analytics, and all available features. <br /><br />

//           <strong>If you pay by bank transfer</strong> <br /><br />

//           Your subscription won't renew automatically. To avoid any interruption, simply sign in to your SoundMac account and complete your payment before your renewal date. <br /><br />

//           If your renewal isn't completed successfully—whether because a card payment fails or a bank transfer isn't received in time—your account may be downgraded and certain features, including new uploads, may become unavailable until payment is completed. <br /><br />

//           You can review your subscription, payment method, and renewal date anytime from your account settings. <br /><br />

//           If you have any questions, simply reply to this email. We'll be happy to help. <br /><br />

//           Thank you for trusting SoundMac. <br /><br />

//           Warm regards,<br />
//           Finance Team<br />
//           SoundMac Global LTD.
//         </body>
//         </html>
//       `,
//     );
//         await UserNotification.create({
//           userId: user._id,
//           reason: "Subscription Renewal",
//           message: `Your subscription is renewing soon on ${new Date(user.premiumExpiration).toDateString()}.`,
//           status: "delivered",
//         });

//         await User.findByIdAndUpdate(user._id, {
//           'subscriptionDetails.renewalReminderSentAt': new Date(),
//         });
//       });
//     }

//     return { remindersSent: usersDueForReminder.length };
//   }
// );