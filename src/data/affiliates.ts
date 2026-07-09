/**
 * Single source of truth for affiliate URLs on news.duacrypto.com.
 * Data lives in affiliates.json (also copied to functions/_shared for /go/* tracking).
 */
import partners from "./affiliates.json";

export type AffiliateKey = keyof typeof partners;

export interface AffiliatePartner {
  key: AffiliateKey;
  name: string;
  href: string;
  goPath: string;
  description: string;
}

export const affiliates = partners as Record<AffiliateKey, AffiliatePartner>;

export const affiliateGoPaths = Object.values(affiliates).map((a) => a.goPath);

export function getAffiliateByGoPath(path: string): AffiliatePartner | undefined {
  return Object.values(affiliates).find((a) => a.goPath === path);
}

export function getAffiliateByKey(name: string): AffiliatePartner | undefined {
  const key = name as AffiliateKey;
  return affiliates[key];
}
