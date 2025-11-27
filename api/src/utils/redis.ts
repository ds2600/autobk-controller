// --------------------------------
// src/util/redis.ts
// --------------------------------

import Redis from "ioredis";
import { env } from "../config/env";

let client: Redis | null = null;

export function getRedis() {
    if (!env.REDIS_ENABLE) return null;
    if (!client) { 
        client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 });
    }
    return client;
}

export async function getOrSetCache<T>(
    key: string,
    ttlSeconds: number = 0,
    loader: () => Promise<T>
): Promise<T> {
    const redis = getRedis();
    if (!redis) {
        return loader();
    }

    const cached = await redis.get(key);
    if (cached) {
        try {
            return JSON.parse(cached) as T;
        } catch {
            // bad cache, ignore it
        }
    } 

    const value = await loader();
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
        // if write fails, return the fresh value
    }
    return value;
}

export async function invalidateCache(prefix: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        const keys = await redis.keys(`${prefix}*`);
        if (!keys.length) return;
        await redis.del(...keys);
    } catch {
        // ignore errors
    }
}

export async function flushCache(): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.flushdb();
    } catch {
        // ignore errors
    }
}
