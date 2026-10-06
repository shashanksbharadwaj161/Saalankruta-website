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
export async function api<T>(
  action: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  if (!csrf) {
    bootstrap ??= (async () => {
      const boot = await fetch(asset("/api/index.php?action=bootstrap"), {
        credentials: "same-origin",
      });
      if (!boot.ok)
        throw new ApiError(
          "The store service is not connected yet. Please try again later.",
          boot.status,
        );
      const session = await boot.json();
      if (typeof session.csrf !== "string" || session.csrf.length !== 64)
        throw new ApiError("The store session could not be opened.");
      csrf = session.csrf;
    })();
    try {
      await bootstrap;
    } finally {
      bootstrap = null;
    }
  }
  const response = await fetch(asset("/api/index.php"), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify({ action, data }),
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      "The store service returned an unexpected response.",
      response.status,
    );
  }
  if (!response.ok)
    throw new ApiError(
      body.message || "We could not complete that request.",
      response.status,
    );
  return body as T;
}
export function resetSession() {
  csrf = "";
  bootstrap = null;
}
