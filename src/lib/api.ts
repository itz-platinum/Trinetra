export class ApiError extends Error {
  status: number;
  data?: Record<string, any>;

  constructor(message: string, status: number, data?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type UnauthorizedHandler = () => void;
type TokenProvider = (forceRefresh?: boolean) => Promise<string | null>;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let tokenProvider: TokenProvider | null = null;
let manualSessionToken: string | null = null;

const SESSION_STORAGE_KEY = 'trinetra_session_token';

export function setManualSessionToken(token: string | null) {
  manualSessionToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }
}

export function getManualSessionToken(): string | null {
  if (manualSessionToken) return manualSessionToken;
  if (typeof window !== 'undefined') {
    try {
      const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        manualSessionToken = stored;
        return stored;
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return null;
}

export function setTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export interface ApiRequestOptions extends RequestInit {
  skipUnauthorizedHandler?: boolean;
  isAuthEndpoint?: boolean;
  _retried?: boolean;
}

function mapErrorMessage(
  status: number,
  serverMessage: string | undefined,
  isAuthEndpoint?: boolean
): string {
  if (status === 401) {
    if (isAuthEndpoint && serverMessage) {
      return serverMessage;
    }
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 400) {
    return serverMessage || 'Please check the information entered.';
  }
  if (status === 404) {
    return serverMessage || 'The requested resource was not found.';
  }
  if (status >= 500) {
    return 'Something went wrong. Please try again.';
  }
  return serverMessage || 'Something went wrong. Please try again.';
}

async function resolveBearerToken(forceRefresh = false): Promise<string | null> {
  if (tokenProvider) {
    const firebaseToken = await tokenProvider(forceRefresh);
    if (firebaseToken) return firebaseToken;
  }
  return getManualSessionToken();
}

async function request<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    skipUnauthorizedHandler = false,
    isAuthEndpoint = false,
    _retried = false,
    headers,
    body,
    ...rest
  } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (!finalHeaders.has('Authorization')) {
    const token = await resolveBearerToken(_retried);
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Network error. Please check your connection and try again.', 0);
  }

  // If Firebase token expired right before request, force-refresh once and retry
  if (response.status === 401 && !_retried && !isAuthEndpoint && tokenProvider) {
    const refreshedToken = await tokenProvider(true);
    if (refreshedToken) {
      const retryHeaders = new Headers(headers);
      if (body !== undefined && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
      return request<T>(url, {
        ...options,
        headers: retryHeaders,
        _retried: true,
      });
    }
  }

  let payload: Record<string, any> = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedHandler) {
      setManualSessionToken(null);
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }
    const friendlyMessage = mapErrorMessage(
      response.status,
      typeof payload.error === 'string' ? payload.error : undefined,
      isAuthEndpoint
    );
    throw new ApiError(friendlyMessage, response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T = any>(url: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' });
  },

  post<T = any>(
    url: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  put<T = any>(
    url: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  delete<T = any>(url: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' });
  },
};
