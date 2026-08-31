import { API_BASE_URL, OFFLINE_DEMO } from './config';

export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[],
  ) {
    super(messages.join(', ') || 'Request failed');
  }
}

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<string | null>;

let getAccessToken: TokenGetter = () => null;
let refreshAccessToken: RefreshHandler = async () => null;
let onAuthFailure: () => void = () => {};

export function configureApiClient(opts: {
  getAccessToken: TokenGetter;
  refreshAccessToken: RefreshHandler;
  onAuthFailure: () => void;
}) {
  getAccessToken = opts.getAccessToken;
  refreshAccessToken = opts.refreshAccessToken;
  onAuthFailure = opts.onAuthFailure;
}

async function request<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  if (OFFLINE_DEMO) {
    const { mockRequest } = await import('./mockData');
    return mockRequest<T>(options.method ?? 'GET', path, options.body as string | undefined);
  }

  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken) return request<T>(path, options, true);
    onAuthFailure();
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const messages = Array.isArray(body?.error) ? body.error : [body?.message ?? 'Something went wrong'];
    throw new ApiError(response.status, messages);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
