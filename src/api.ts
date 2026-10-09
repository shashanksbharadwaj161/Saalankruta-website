import { asset } from "./assets";
let csrf = "";
let bootstrap: Promise<void> | null = null;
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
async function request(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    let body;
    try {
      body = await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new ApiError(
        "The store service returned an unexpected response. Please try again.",
        response.status,
      );
    }
    return { response, body };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      controller.signal.aborted
        ? "The store took too long to respond. Check your connection and try again."
        : "We could not reach the store. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }
}
export async function api<T>(
  action: string,
  data: Record<string, unknown> = {},
  retrySession = true,
): Promise<T> {
  if (!csrf) {
    bootstrap ??= (async () => {
      const { response: boot, body: session } = await request(
        asset("/api/index.php?action=bootstrap"),
        {
          credentials: "same-origin",
        },
      );
      if (!boot.ok)
        throw new ApiError(
          "The store service is not connected yet. Please try again later.",
          boot.status,
        );
      if (typeof session?.csrf !== "string" || session.csrf.length !== 64)
        throw new ApiError("The store session could not be opened.");
      csrf = session.csrf;
    })();
    try {
      await bootstrap;
    } finally {
      bootstrap = null;
    }
  }
  const requestCsrf = csrf;
  const { response, body } = await request(asset("/api/index.php"), {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": requestCsrf,
    },
    body: JSON.stringify({ action, data }),
  });
  // This specific rejection happens before an operation runs. Never retry a
  // mutation after a network timeout or any other ambiguous failure.
  if (
    retrySession &&
    response.status === 403 &&
    body?.message ===
      "Your session has expired. Refresh the page and try again."
  ) {
    if (csrf === requestCsrf) resetSession();
    return api<T>(action, data, false);
  }
  if (!response.ok)
    throw new ApiError(
      body?.message || "We could not complete that request.",
      response.status,
    );
  return body as T;
}
export function resetSession() {
  csrf = "";
  bootstrap = null;
}
