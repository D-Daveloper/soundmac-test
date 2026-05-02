// import { Redis } from "@upstash/redis";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// const TOKEN_KEY = "dsp:token";

export async function getDSPToken(): Promise<string> {
    //   const cached = await redis.get<string>(TOKEN_KEY);

    //   if (cached) return cached;

    const res = await fetch("https://app.dpmnetworks.com/access-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userName: process.env.DPM_USERNAME_V2,
            password: process.env.DPM_PASSWORD_V2,
        }),
    });
    // console.log(res);


    if (!res.ok) throw new Error("Failed to fetch DSP token");

    const data = await res.json();
    if (!data.result.accessToken) throw new Error("Dsp bearer token is missing");

    //   await redis.set(TOKEN_KEY, data.result.accessToken, {
    //     ex: data.expires_in - 60,
    //   });
    return data.result.accessToken;
}