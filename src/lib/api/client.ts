import "server-only";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

/**
 * Thrown when the API answers with a non-2xx that is not a 404.
 * Pages let this bubble to the nearest error boundary rather than rendering a
 * half-empty gallery that looks like an empty catalogue.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions {
  /**
   * Seconds to cache. The catalogue is curator-edited and read constantly, so
   * a short revalidate window is worth far more than it costs — but it must be
   * short enough that publishing a work shows up without a redeploy.
   */
  revalidate?: number;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const url = `${BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: options.revalidate ?? 60 },
      signal: options.signal,
    });
  } catch (cause) {
    // A refused connection is the API being down, not an empty catalogue.
    throw new ApiError(
      `Could not reach the Artessa API at ${BASE_URL}. Is it running?`,
      0,
      url,
    );
  }

  // 404 is a legitimate answer to "does this slug exist" — the caller turns it
  // into notFound(). Everything else is a failure worth surfacing.
  if (response.status === 404) return null;

  if (!response.ok) {
    throw new ApiError(
      `${response.status} ${response.statusText} from ${path}`,
      response.status,
      url,
    );
  }

  return (await response.json()) as T;
}

export const api = { request, BASE_URL };
