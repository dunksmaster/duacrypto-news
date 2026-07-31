/**
 * Local/static fallback for /go/* affiliate redirects.
 * On Cloudflare Pages production, functions/go/[name].ts handles this (with D1 click tracking).
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { affiliates, type AffiliateKey } from "../../data/affiliates";

export const prerender = true;

export const getStaticPaths = (() => {
  return Object.keys(affiliates).map((name) => ({ params: { name } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const key = (params.name ?? "").toLowerCase() as AffiliateKey;
  const partner = affiliates[key];

  if (!partner) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: partner.href },
  });
};
