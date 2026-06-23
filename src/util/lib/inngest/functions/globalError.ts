import { inngest } from "../inngest";
import { SendEmail } from "./email";

export const globalErrorHandler = inngest.createFunction(
    {
        id: "global-error-handler",
        triggers: { event: "inngest/function.failed" },
    },// Global failure listener
    async ({ event, step }) => {
        // Global error handling logic (e.g., send to Datadog)
        const failedFunctionId = event.data.function_id;
        const errorMessage = event.data.error.message;

        console.error(`Global alert: Function ${failedFunctionId} failed.`);
        await step.invoke("send-erro-details", {
            function: SendEmail,
            data: {
                html: errorMessage?.toString(),
                emailTo: "Admin@soundmac.co",
                title: failedFunctionId
            },
        });
    }
);
