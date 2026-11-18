import { API_URL } from './constants';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let inMemoryJwt: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryJwt = token;
}

export function getAuthToken(): string | null {
  return inMemoryJwt;
}

export async function fetchSessionToken() {
  const res = await fetch(`${API_URL}/api/token`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setAuthToken(null);
    throw new ApiError(data?.message || 'Unable to authenticate session.', res.status, data?.code);
  }

  setAuthToken(data.token);
  return data as { success: boolean; token: string; user: import('@/types').UserProfile };
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, retryOnUnauthorized = true, headers, ...rest } = options;

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
    try {
      await fetchSessionToken();
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    } catch (err) {
      throw err;
    }
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.code
    );
  }

  return payload as T;
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
