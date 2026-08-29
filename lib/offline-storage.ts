/**
 * Offline Storage & Cache Engine for Web App
 *
 * Provides localStorage caching with TTL expiration, fallback retrieval,
 * and offline sync queues for browser clients.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

export const CACHE_KEYS = {
  ACADEMY_COURSES: "bws_cache_academy_courses",
  USER_COURSES: "bws_cache_user_courses",
  RENTALS_CATALOG: "bws_cache_rentals_catalog",
  STUDIO_ORDERS: "bws_cache_studio_orders",
  USER_NOTIFICATIONS: "bws_cache_user_notifications",
  HUB_SNACKS: "bws_cache_hub_snacks",
  OFFLINE_ACTION_QUEUE: "bws_offline_action_queue",
} as const;

export const DEFAULT_TTLS = {
  SHORT: 5 * 60 * 1000,
  MEDIUM: 15 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

class WebOfflineStorageEngine {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private actionQueue: OfflineAction[] = [];

  setCachedData<T>(key: string, data: T, ttlMs: number = DEFAULT_TTLS.MEDIUM): CacheEntry<T> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
      key,
    };

    this.memoryCache.set(key, entry);

    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // Storage full or disabled
      }
    }

    return entry;
  }

  getCachedData<T>(key: string, allowStale: boolean = false): T | null {
    let entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    if (!entry && typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          entry = JSON.parse(raw) as CacheEntry<T>;
          if (entry) {
            this.memoryCache.set(key, entry);
          }
        }
      } catch {
        // Parsing error
      }
    }

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now > entry.expiresAt;

    if (isExpired && !allowStale) {
      return null;
    }

    return entry.data;
  }

  removeCachedData(key: string): boolean {
    const deleted = this.memoryCache.delete(key);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignored
      }
    }
    return deleted;
  }

  clearAll(): void {
    this.memoryCache.clear();
    this.actionQueue = [];
    if (typeof localStorage !== "undefined") {
      try {
        for (const key of Object.values(CACHE_KEYS)) {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignored
      }
    }
  }

  enqueueOfflineAction(type: string, payload: Record<string, any>): OfflineAction {
    const action: OfflineAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.actionQueue.push(action);
    return action;
  }

  getPendingOfflineActions(): OfflineAction[] {
    return [...this.actionQueue];
  }

  removeOfflineAction(id: string): boolean {
    const initLen = this.actionQueue.length;
    this.actionQueue = this.actionQueue.filter((a) => a.id !== id);
    return this.actionQueue.length < initLen;
  }
}

export const offlineStorage = new WebOfflineStorageEngine();
