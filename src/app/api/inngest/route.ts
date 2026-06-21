import { serve } from "inngest/next";
import { inngest } from "@/util/lib/inngest/inngest";
import { generateReport, uploadSalesReport } from "@/util/lib/inngest/functions/salesReport";
import { deleteAlbumData } from "@/util/lib/inngest/functions/album";
import { SendEmail } from "@/util/lib/inngest/functions/email";
import { releaseDelivery } from "@/util/lib/inngest/functions/dpm";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [uploadSalesReport,generateReport,deleteAlbumData,SendEmail,releaseDelivery],
});