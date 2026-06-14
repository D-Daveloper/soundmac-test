import { inngest } from "../inngest";
import sendEmail from "@/util/sendMail/sendEmail";

export const SendEmail = inngest.createFunction(
    { id: "send-email", triggers: { event: "send-email" } },
    async ({ event, step }) => {
        const { html, emailTo, title } = event.data as { html: string; emailTo: string, title: string }
        
        // Delete each track individually so partial failures are tracked
        const Email = await step.run('email', async () => {
            try {
                console.log(emailTo,title);
                const email = await sendEmail(emailTo, title, html);
                console.log("email sent",email);
            } catch (error) {
                throw error;
            }
        })

        return { success: true };

    }
);