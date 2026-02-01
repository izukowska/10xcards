import { defineMiddleware } from "astro:middleware";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Database } from "../db/database.types";

const publicRoutes = ["/login", "/register", "/forgot-password", "/auth/callback", "/"];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient<Database>(
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

  context.locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  const isPublicRoute = publicRoutes.some((route) => {
    return context.url.pathname === route || context.url.pathname.startsWith(route + "/");
  });

  // Also treat API routes as public or handle them separately?
  // Usually /api/auth/* needs to be accessible.
  // And assets/images etc.
  if (
    context.url.pathname.startsWith("/api/") ||
    context.url.pathname.startsWith("/_image") ||
    context.url.pathname.includes(".")
  ) {
    return next();
  }

  // Auth Guard
  if (!user && !isPublicRoute) {
    return context.redirect("/login");
  }

  // Redirect if logged in and trying to access auth pages
  if (user && (context.url.pathname === "/login" || context.url.pathname === "/register")) {
    return context.redirect("/generate");
  }

  return next();
});
