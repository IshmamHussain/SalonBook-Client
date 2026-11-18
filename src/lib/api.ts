import { API_URL } from './constants';

export class ApiError extends Error {
  status: number;
  code?: string;
  user?: import('@/types').UserProfile;

  constructor(message: string, status: number, code?: string, user?: import('@/types').UserProfile) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.user = user;
  }
}

let inMemoryJwt: string | null = null;
let inFlightTokenPromise: Promise<{
  success: boolean;
  token: string;
  user: import('@/types').UserProfile;
}> | null = null;

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const PUBLIC_CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, CacheEntry>();
const inFlightGets = new Map<string, Promise<unknown>>();

export function getCachedResponse<T>(path: string, allowStale = true): T | null {
  const entry = responseCache.get(path);
  if (!entry) return null;
  if (!allowStale && Date.now() >= entry.expiresAt) return null;
  return entry.data as T;
}

export function isCacheFresh(path: string): boolean {
  const entry = responseCache.get(path);
  return Boolean(entry && Date.now() < entry.expiresAt);
}

export function invalidatePublicCache() {
  responseCache.clear();
}

export function setAuthToken(token: string | null) {
  inMemoryJwt = token;
}

export function getAuthToken(): string | null {
  return inMemoryJwt;
}

export async function fetchSessionToken() {
  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  inFlightTokenPromise = (async () => {
    const res = await fetch(`${API_URL}/api/token`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAuthToken(null);
      throw new ApiError(
        data?.message || 'Unable to authenticate session.',
        res.status,
        data?.code,
        data?.user
      );
    }

    setAuthToken(data.token);
    return data as { success: boolean; token: string; user: import('@/types').UserProfile };
  })();

  try {
    return await inFlightTokenPromise;
  } finally {
    inFlightTokenPromise = null;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
  cacheTtlMs?: number;
  forceRefresh?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    auth = false,
    retryOnUnauthorized = true,
    cacheTtlMs,
    forceRefresh = false,
    headers,
    ...rest
  } = options;

  const method = (rest.method || 'GET').toUpperCase();
  const isCacheableGet = !auth && method === 'GET' && (cacheTtlMs ?? 0) > 0;
  const isServiceMutation = method !== 'GET' && path.startsWith('/api/admin/services');

  if (isServiceMutation) {
    invalidatePublicCache();
  }

  if (isCacheableGet && !forceRefresh) {
    const cached = getCachedResponse<T>(path, false);
    if (cached !== null) {
      return cached;
    }
    const existing = inFlightGets.get(path);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const execute = async (): Promise<T> => {
    const finalHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    if (!(rest.body instanceof FormData) && rest.body !== undefined && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    if (auth) {
      if (!inMemoryJwt) {
        await fetchSessionToken();
      }
      if (inMemoryJwt) {
        finalHeaders.Authorization = `Bearer ${inMemoryJwt}`;
      }
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers: finalHeaders,
    });

    if (response.status === 401 && auth && retryOnUnauthorized) {
      await fetchSessionToken();
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 403 && payload?.code === 'USER_BLOCKED') {
        setAuthToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('salonbook:user-blocked', {
              detail: payload?.message || 'Your account has been blocked by the salon administrator.',
            })
          );
        }
      }
      throw new ApiError(
        payload?.message || `Request failed with status ${response.status}`,
        response.status,
        payload?.code
      );
    }

    if (isCacheableGet) {
      responseCache.set(path, {
        data: payload,
        expiresAt: Date.now() + (cacheTtlMs ?? PUBLIC_CACHE_TTL_MS),
      });
    } else if (isServiceMutation) {
      invalidatePublicCache();
    }

    return payload as T;
  };

  if (isCacheableGet) {
    const promise = execute().finally(() => {
      inFlightGets.delete(path);
    });
    inFlightGets.set(path, promise);
    return promise;
  }

  return execute();
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.url) {
    throw new ApiError(payload?.message || 'Image upload failed. Please try another file.', response.status);
  }

  return payload.url as string;
}
