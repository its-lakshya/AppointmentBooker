export async function apiRequest<T>(
  endpoint: string,
  {
    method = "GET",
    body,
    headers,
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    // eslint-disable-next-line
    body?: any;
    headers?: HeadersInit;
  } = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(endpoint, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: errText || `Error: ${response.status}` };
    }
    
    const data = await response.json();
    return { data, error: null };
    // eslint-disable-next-line
  } catch (err: any) {
    return { data: null, error: err.message || "Network error" };
  }
}
