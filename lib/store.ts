import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { InventorySnapshot } from "./types";

const STORE_KEY = "hf-e-autos:inventory";
const LOCAL_FILE = path.join(process.cwd(), "data", "vehicles.json");

type Backend = "vercel-kv" | "upstash" | "redis-url" | "file";

function detectBackend(): Backend {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) return "vercel-kv";
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    return "upstash";
  if (process.env.REDIS_URL) return "redis-url";
  return "file";
}

export function storageBackend(): Backend {
  return detectBackend();
}

// ── Upstash / Vercel KV (REST) ───────────────────────────────
async function getUpstashClient() {
  const { Redis } = await import("@upstash/redis");
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  return new Redis({ url, token });
}

// ── ioredis (connection string) ──────────────────────────────
async function getIoRedisClient() {
  const mod = await import("ioredis");
  const RedisCtor = (mod.default ?? mod) as unknown as new (url: string) => {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<unknown>;
    quit(): Promise<unknown>;
  };
  return new RedisCtor(process.env.REDIS_URL as string);
}

// ── File (local dev only) ────────────────────────────────────
async function readFileSnapshot(): Promise<InventorySnapshot | null> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as InventorySnapshot;
  } catch {
    return null;
  }
}

async function writeFileSnapshot(snapshot: InventorySnapshot): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(snapshot, null, 2), "utf8");
}

// ── Public API ───────────────────────────────────────────────
export async function getSnapshot(): Promise<InventorySnapshot | null> {
  const backend = detectBackend();
  try {
    switch (backend) {
      case "vercel-kv":
      case "upstash": {
        const client = await getUpstashClient();
        const value = await client.get<InventorySnapshot>(STORE_KEY);
        return value ?? null;
      }
      case "redis-url": {
        const client = await getIoRedisClient();
        try {
          const raw = await client.get(STORE_KEY);
          return raw ? (JSON.parse(raw) as InventorySnapshot) : null;
        } finally {
          await client.quit().catch(() => {});
        }
      }
      case "file":
      default:
        return await readFileSnapshot();
    }
  } catch (error) {
    console.error(`[store] getSnapshot failed (${backend}):`, error);
    return null;
  }
}

export async function setSnapshot(snapshot: InventorySnapshot): Promise<void> {
  const backend = detectBackend();
  switch (backend) {
    case "vercel-kv":
    case "upstash": {
      const client = await getUpstashClient();
      await client.set(STORE_KEY, snapshot);
      return;
    }
    case "redis-url": {
      const client = await getIoRedisClient();
      try {
        await client.set(STORE_KEY, JSON.stringify(snapshot));
      } finally {
        await client.quit().catch(() => {});
      }
      return;
    }
    case "file":
    default:
      await writeFileSnapshot(snapshot);
      return;
  }
}
