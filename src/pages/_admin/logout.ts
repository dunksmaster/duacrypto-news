import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  context.response.headers.set(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; Max-Age=0"
  );
  return context.redirect("/admin");
};
