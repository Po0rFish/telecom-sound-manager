export const DEMO_MESSAGE = "Demo version: changes are not saved. You can explore the forms and preview audio locally.";

// Fixed for this public demo; no browser setting enables writes.
export const isReadOnlyDemo = () => true;

export function createDemoFetch(networkFetch: typeof fetch): typeof fetch {
  return async (input, init) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      return new Response(JSON.stringify({ message: DEMO_MESSAGE, error: DEMO_MESSAGE }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return networkFetch(input, init);
  };
}
