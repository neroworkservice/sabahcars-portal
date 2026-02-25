import { createBrowserClient } from "@supabase/ssr";

const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  return fetch(url, {
    ...init,
    headers: {
      ...((init?.headers as Record<string, string>) || {}),
      'connection': 'close',
    },
  });
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: customFetch,
      },
    }
  );
}
