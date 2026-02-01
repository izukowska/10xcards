import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ redirect, locals }) => {
  const { supabase } = locals;
  await supabase.auth.signOut();

  // Clear cookies explicitly if needed, but signOut should handle it
  // cookies.delete("sb-access-token", { path: "/" });
  // cookies.delete("sb-refresh-token", { path: "/" });

  return redirect("/login");
};
