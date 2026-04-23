export const SUPABASE_REQUEST_TIMEOUT_MS = 1800;

export function createSupabaseTimeoutFetch(timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS) {
  return async function timeoutFetch(input: RequestInfo | URL, init?: RequestInit) {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const abortListener = () => {
      controller.abort(init?.signal?.reason);
    };

    if (init?.signal) {
      if (init.signal.aborted) {
        controller.abort(init.signal.reason);
      } else {
        init.signal.addEventListener("abort", abortListener, { once: true });
      }
    }

    const request = fetch(input, {
      ...init,
      signal: controller.signal,
    });

    const timeoutPromise = new Promise<Response>((_, reject) => {
      timeoutId = globalThis.setTimeout(() => {
        controller.abort();
        reject(new Error(`Supabase request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([request, timeoutPromise]);
    } finally {
      if (timeoutId) {
        globalThis.clearTimeout(timeoutId);
      }

      if (init?.signal) {
        init.signal.removeEventListener("abort", abortListener);
      }
    }
  };
}
