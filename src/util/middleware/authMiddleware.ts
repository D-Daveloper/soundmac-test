// lib/authMiddleware.js

import dbConnect from "../db";
import { hashApiKey } from "../lib/apikey/apiKey";
import ApiKeyModel from "../models/apiKeyModel";
import { verifyJWT, verifyUser } from "./verifyJwt";

export async function authenticate(req: Request) {
    const authHeader = req.headers.get('authorization') || '';

    // --- API Key Auth (for external devs) ---
    if (authHeader.startsWith('Bearer sm_live_')) {
        await dbConnect();
        const rawKey = authHeader.replace('Bearer ', '');
        const hashed = hashApiKey(rawKey);

        const apiKey = await ApiKeyModel.findOne({
            hashedKey: hashed,
        }, { userId: 1, expiresAt: 1,isActive: 1 });

        if (!apiKey || !apiKey.isActive) return { user: null, msg: "Invalid Request", authType: 'api_key' };

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return { user: null, msg: "Invalid Request", authType: 'api_key' };

        // Update last used timestamp (non-blocking)
        ApiKeyModel.findByIdAndUpdate(apiKey._id, {
            lastUsedAt: new Date(),
            updatedAt: new Date()
        }).catch(() => { });

        return { user: apiKey.userId, msg: null, authType: 'api_key' };
    } else {
        const payload = await verifyJWT();
        const user = verifyUser(payload);
        return { ...user, authType: 'jwt' };
    }

}