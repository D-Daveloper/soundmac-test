import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import { authenticate } from "@/util/middleware/authMiddleware";

// Promisify the child_process exec tool for cleaner async/await usage
const execAsync = promisify(exec);

/**
 * PRODUCTION CONSTRAINTS & CONFIGURATION
 * Render allows up to a 100-minute timeout, but Next.js framework configurations
 * can force cut-offs. We explicitly declare a high max duration.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
    // Track temporary file locations within block scope so the 'finally' loop can always target them
    let inputPath: string | null = null;
    let outputPath: string | null = null;

    try {
        // 1. Process Multipart Payload safely
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ msg: "No file payload detected" }, { status: 400 });
        }

        // 2. Strict Server-Side Size Validation (Bypasses forged client limits)
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { msg: `File size exceeds the rigid server limit of ${MAX_FILE_SIZE_MB}MB.` },
                { status: 413 }
            );
        }

        const userJwt = await authenticate(req);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }

        // 3. File System Naming & Collision Avoidance
        const originalName = file.name;
        const parsedName = path.parse(originalName);
        const outputFilename = `${parsedName.name}.flac`;

        // Target the operating system's native /tmp mount
        const tempDir = os.tmpdir();
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        inputPath = path.join(tempDir, `in_${uniqueId}_${originalName}`);
        outputPath = path.join(tempDir, `out_${uniqueId}_${outputFilename}`);

        // 4. Stream binary data directly to disk instead of locking arrays in RAM memory
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(inputPath, buffer);

        // 5. Execute FFMPEG conversion natively within the Render/Docker runtime environment
        // Explicitly wraps file routes in quotes to defend against special character shell injection attacks
        await execAsync(`ffmpeg -y -i "${inputPath}" -c:a flac "${outputPath}"`);

        // Verify file generation succeeded before attempting stream sequence
        if (!fs.existsSync(outputPath)) {
            throw new Error("FFmpeg completed execution but output binary was missing.");
        }

        // 6. Construct an isolated Node read stream mapped over the output resource
        const fileStream = fs.createReadStream(outputPath);

        // Bind paths to locally scoped pointers so the stream closures can execute async cleanups
        const localInputPath = inputPath;
        const localOutputPath = outputPath;

        // Reset loop markers so the parent 'finally' block doesn't trigger a racing file-lock collision
        inputPath = null;
        outputPath = null;

        // 7. Pipe to a standard Web ReadableStream compatible with Next.js Response primitives
        const webStream = new ReadableStream({
            start(controller) {
                fileStream.on("data", (chunk) => controller.enqueue(chunk));
                fileStream.on("end", () => {
                    controller.close();
                    // Clean up disk structures immediately after transmission yields success
                    fs.promises.unlink(localInputPath).catch(console.error);
                    fs.promises.unlink(localOutputPath).catch(console.error);
                });
                fileStream.on("error", (err) => {
                    controller.error(err);
                    fs.promises.unlink(localInputPath).catch(console.error);
                    fs.promises.unlink(localOutputPath).catch(console.error);
                });
            },
            cancel() {
                fileStream.destroy();
                fs.promises.unlink(localInputPath).catch(console.error);
                fs.promises.unlink(localOutputPath).catch(console.error);
            }
        });

        // 8. Stream output directly with headers that dictate localized OS downloads
        return new Response(webStream, {
            status: 200,
            headers: {
                "Content-Type": "audio/flac",
                "Content-Disposition": `attachment; filename="${encodeURIComponent(outputFilename)}"`,
                "Cache-Control": "no-store, max-age=0",
            },
        });

    } catch (error: any) {
        console.error("[CRITICAL API ERROR]:", error);
        return NextResponse.json(
            { msg: "Audio conversion pipeline exception encountered." },
            { status: 500 }
        );
    } finally {
        // Safety Catch: If code crashed BEFORE spawning the custom WebStream pipeline, 
        // clean up stray file system tracks to prevent Render disk starvation.
        if (inputPath && fs.existsSync(inputPath)) {
            await fs.promises.unlink(inputPath).catch(console.error);
        }
        if (outputPath && fs.existsSync(outputPath)) {
            await fs.promises.unlink(outputPath).catch(console.error);
        }
    }
}
