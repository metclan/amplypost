"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CacheEntry<T> = {
    data?: T;
    error?: Error;
    updatedAt: number;
    promise?: Promise<T>;
};

type UseCachedResourceOptions<T> = {
    enabled?: boolean;
    ttl?: number;
    initialData?: T;
};

type UseCachedResourceResult<T> = {
    data: T | undefined;
    error: Error | undefined;
    isLoading: boolean;
    isRefreshing: boolean;
    refetch: () => Promise<T>;
};

const DEFAULT_TTL = 60_000;
const STORAGE_PREFIX = "amplypost-cache:";
const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

function getStorageKey(key: string) {
    return `${STORAGE_PREFIX}${key}`;
}

function canUseStorage() {
    return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function readStored<T>(key: string): CacheEntry<T> | undefined {
    if (!canUseStorage()) return undefined;

    try {
        const stored = window.sessionStorage.getItem(getStorageKey(key));
        if (!stored) return undefined;
        const parsed = JSON.parse(stored) as { data: T; updatedAt: number };
        return { data: parsed.data, updatedAt: parsed.updatedAt };
    } catch {
        window.sessionStorage.removeItem(getStorageKey(key));
        return undefined;
    }
}

function writeStored<T>(key: string, entry: CacheEntry<T>) {
    if (!canUseStorage() || entry.data === undefined) return;

    try {
        window.sessionStorage.setItem(
            getStorageKey(key),
            JSON.stringify({ data: entry.data, updatedAt: entry.updatedAt }),
        );
    } catch {
        // Ignore storage quota/privacy failures; in-memory cache still works.
    }
}

function getEntry<T>(key: string): CacheEntry<T> | undefined {
    const memoryEntry = cache.get(key) as CacheEntry<T> | undefined;
    if (memoryEntry) return memoryEntry;

    const storedEntry = readStored<T>(key);
    if (storedEntry) {
        cache.set(key, storedEntry);
    }
    return storedEntry;
}

function setEntry<T>(key: string, entry: CacheEntry<T>) {
    cache.set(key, entry);
    writeStored(key, entry);
    listeners.get(key)?.forEach((listener) => listener());
}

function isFresh(entry: CacheEntry<unknown> | undefined, ttl: number) {
    return Boolean(entry?.data !== undefined && Date.now() - entry.updatedAt < ttl);
}

export function subscribeCachedResource(key: string, listener: () => void) {
    const keyListeners = listeners.get(key) ?? new Set<() => void>();
    keyListeners.add(listener);
    listeners.set(key, keyListeners);

    return () => {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
            listeners.delete(key);
        }
    };
}

export function invalidateCachedResource(keyOrPrefix: string) {
    for (const key of Array.from(cache.keys())) {
        if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
            cache.delete(key);
            listeners.get(key)?.forEach((listener) => listener());
        }
    }

    if (!canUseStorage()) return;

    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
        const storageKey = window.sessionStorage.key(index);
        if (!storageKey?.startsWith(STORAGE_PREFIX)) continue;
        const cacheKey = storageKey.slice(STORAGE_PREFIX.length);
        if (cacheKey === keyOrPrefix || cacheKey.startsWith(keyOrPrefix)) {
            window.sessionStorage.removeItem(storageKey);
        }
    }
}

export async function fetchCachedResource<T>({
    key,
    fetcher,
    ttl = DEFAULT_TTL,
    force = false,
}: {
    key: string;
    fetcher: () => Promise<T>;
    ttl?: number;
    force?: boolean;
}): Promise<T> {
    const entry = getEntry<T>(key);

    if (!force && isFresh(entry, ttl) && entry?.data !== undefined) {
        return entry.data;
    }

    if (entry?.promise) {
        return entry.promise;
    }

    const promise = fetcher()
        .then((data) => {
            setEntry<T>(key, { data, updatedAt: Date.now() });
            return data;
        })
        .catch((error) => {
            const normalizedError = error instanceof Error ? error : new Error("Failed to fetch data.");
            setEntry<T>(key, {
                data: entry?.data,
                error: normalizedError,
                updatedAt: entry?.updatedAt ?? 0,
            });
            throw normalizedError;
        });

    setEntry<T>(key, { ...entry, promise, updatedAt: entry?.updatedAt ?? 0 });
    return promise;
}

export function useCachedResource<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: UseCachedResourceOptions<T> = {},
): UseCachedResourceResult<T> {
    const { enabled = true, ttl = DEFAULT_TTL, initialData } = options;
    const initialEntry = useMemo(() => getEntry<T>(key), [key]);
    const [data, setData] = useState<T | undefined>(initialEntry?.data ?? initialData);
    const [error, setError] = useState<Error | undefined>(initialEntry?.error);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(enabled && data === undefined);

    useEffect(() => {
        const syncFromCache = () => {
            const nextEntry = getEntry<T>(key);
            setData(nextEntry?.data ?? initialData);
            setError(nextEntry?.error);
        };

        return subscribeCachedResource(key, syncFromCache);
    }, [initialData, key]);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }

        let isCurrent = true;
        const entry = getEntry<T>(key);
        const shouldFetch = !isFresh(entry, ttl);

        setData(entry?.data ?? initialData);
        setError(entry?.error);
        setIsLoading(shouldFetch && entry?.data === undefined && initialData === undefined);
        setIsRefreshing(shouldFetch && (entry?.data !== undefined || initialData !== undefined));

        if (!shouldFetch) return;

        fetchCachedResource({ key, fetcher, ttl })
            .catch(() => undefined)
            .finally(() => {
                if (isCurrent) {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [enabled, fetcher, initialData, key, ttl]);

    const refetch = useCallback(async () => {
        setIsRefreshing(true);
        try {
            return await fetchCachedResource({ key, fetcher, ttl, force: true });
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    }, [fetcher, key, ttl]);

    return { data, error, isLoading, isRefreshing, refetch };
}
