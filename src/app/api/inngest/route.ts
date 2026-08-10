import { serve } from "inngest/next";
import { inngest } from "@/util/lib/inngest/inngest";
import { generateReport, uploadSalesReport } from "@/util/lib/inngest/functions/salesReport";
import { deleteAlbumData } from "@/util/lib/inngest/functions/album";
import { SendEmail } from "@/util/lib/inngest/functions/email";
import { releaseDelivery } from "@/util/lib/inngest/functions/dpm";
import { globalErrorHandler } from "@/util/lib/inngest/functions/globalError";
import { deliveryLogSync } from "@/util/lib/inngest/functions/deliverySync";
import { subscriptionExpirySweep } from "@/util/lib/inngest/functions/subscriptionExpirySweep";
import { subscriptionRenewalReminder } from "@/util/lib/inngest/functions/subscriptionRenewal";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [uploadSalesReport,generateReport,deleteAlbumData,SendEmail,releaseDelivery,globalErrorHandler, deliveryLogSync, subscriptionExpirySweep, subscriptionRenewalReminder]
});