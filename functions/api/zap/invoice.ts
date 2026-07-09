import { json } from "../_shared/validators";

interface Env {
  DB?: D1Database;
}

interface LnurlpMeta {
  callback: string;
  minSendable: number;
  maxSendable: number;
  metadata: string;
  tag: string;
}

function parseLightningAddress(address: string): { user: string; domain: string } | null {
  const m = address.trim().match(/^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  if (!m) return null;
  return { user: m[1], domain: m[2] };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return json({ error: "method not allowed" }, { status: 405 });
  }

  let body: { address?: string; amountMsat?: number; comment?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = body.address ? parseLightningAddress(body.address) : null;
  if (!parsed) {
    return json({ error: "invalid lightning address" }, { status: 400 });
  }

  const amountMsat = Math.min(Math.max(Number(body.amountMsat) || 1000, 1000), 10_000_000);
  const comment = (body.comment || "DuaCrypto News zap").slice(0, 160);

  try {
    const metaUrl = `https://${parsed.domain}/.well-known/lnurlp/${parsed.user}`;
    const metaRes = await fetch(metaUrl, { headers: { Accept: "application/json" } });
    if (!metaRes.ok) {
      return json({ error: "lnurlp lookup failed" }, { status: 502 });
    }
    const meta = (await metaRes.json()) as LnurlpMeta;
    if (meta.tag !== "payRequest" || !meta.callback) {
      return json({ error: "invalid lnurlp response" }, { status: 502 });
    }

    const invoiceUrl = new URL(meta.callback);
    invoiceUrl.searchParams.set("amount", String(amountMsat));
    invoiceUrl.searchParams.set("comment", comment);

    const invRes = await fetch(invoiceUrl.toString(), { headers: { Accept: "application/json" } });
    if (!invRes.ok) {
      return json({ error: "invoice request failed" }, { status: 502 });
    }
    const inv = (await invRes.json()) as { pr?: string; status?: string };
    if (!inv.pr) {
      return json({ error: "no payment request returned" }, { status: 502 });
    }

    return json({ pr: inv.pr, amountMsat, comment });
  } catch {
    return json({ error: "zap proxy error" }, { status: 502 });
  }
};
