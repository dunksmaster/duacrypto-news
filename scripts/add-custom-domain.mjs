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
if (!token) throw new Error("No wrangler oauth token");

const account = "51d0340bb43eebb07f7c2da17733c3e9";
const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/dc-news/domains`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "news.duacrypto.com" }),
  },
);
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
if (!json.success) process.exit(1);
