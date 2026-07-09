import affiliates from "./affiliates.json";

export type AffiliateRecord = (typeof affiliates)[keyof typeof affiliates];

export function getAffiliate(name: string): AffiliateRecord | undefined {
  const key = name as keyof typeof affiliates;
  return affiliates[key];
}

export const affiliateKeys = Object.keys(affiliates);
