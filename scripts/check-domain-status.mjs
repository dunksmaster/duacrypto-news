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

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/dc-news/domains`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const json = await res.json();
for (const d of json.result ?? []) {
  console.log(`${d.name}: status=${d.status}, validation=${d.validation_data?.status}`);
}
