import { serve } from "inngest/next";
import { inngest } from "@/util/lib/inngest/inngest";
import { generateReport, uploadSalesReport } from "@/util/lib/inngest/functions/salesReport";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [uploadSalesReport,generateReport],
});