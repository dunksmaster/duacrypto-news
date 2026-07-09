import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const configPath = join(
  homedir(),
  "AppData",
  "Roaming",
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const token = readFileSync(configPath, "utf8").match(/oauth_token = "([^"]+)"/)?.[1];
const account = "51d0340bb43eebb07f7c2da17733c3e9";
const zone = "duacrypto.com";

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  return res.json();
}

const domains = await cf(`/accounts/${account}/pages/projects/dc-news/domains`);
console.log("Pages domains:", JSON.stringify(domains.result, null, 2));

const dns = await cf(`/zones?name=${zone}`);
const zoneId = dns.result?.[0]?.id;
if (!zoneId) {
  console.error("Zone not found");
  process.exit(1);
}

const records = await cf(`/zones/${zoneId}/dns_records?name=news.duacrypto.com`);
console.log("DNS records:", JSON.stringify(records.result, null, 2));

if (!records.result?.length) {
  console.log("Creating CNAME news -> dc-news-9n3.pages.dev");
  const create = await cf(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: "news",
      content: "dc-news-9n3.pages.dev",
      proxied: true,
      ttl: 1,
    }),
  });
  console.log("Create result:", JSON.stringify(create, null, 2));
  if (!create.success) process.exit(1);
}
