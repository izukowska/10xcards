import type { APIRoute } from "astro";
import { createServerClient } from "../../lib/supabase";

export const GET: APIRoute = async (context) => {
  const requestUrl = new URL(context.request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createServerClient(context);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return context.redirect(next);
    }
  }

  // Return the user to an error page with instructions
  return context.redirect("/auth/auth-code-error");
};
