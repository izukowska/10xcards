import { createBrowserClient as createBrowserClientSSR, createServerClient as createServerClientSSR, parseCookieHeader } from "@supabase/ssr";
import type { Database } from "../db/database.types";
import type { APIContext } from "astro";

export const createBrowserClient = () =>
  createBrowserClientSSR<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY
  );

export const createServerClient = (context: APIContext) => {
  return createServerClientSSR<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            context.cookies.set(name, value, options);
          });
        },
      },
    }
  );
};
