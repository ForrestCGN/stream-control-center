const DEFAULT_BASE_URL = "";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${DEFAULT_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {})
    }
  });

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
