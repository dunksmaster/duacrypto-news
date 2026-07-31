import catalogIndex from "../data/catalog/index.json";
import customOverlay from "../data/catalog/custom.json";
import type { Locale } from "../i18n/ui";
import { t } from "../i18n/ui";

/** TBH item-type folders + custom mining category */
export const TBH_CATEGORY_IDS = [
  "books",
  "hardware-wallets",
  "software-wallets",
  "bitcoin-nodes",
  "seed-backup",
  "inheritance",
] as const;

export const CUSTOM_CATEGORY_IDS = ["mining"] as const;

export const ALL_CATALOG_CATEGORY_IDS = [...TBH_CATEGORY_IDS, ...CUSTOM_CATEGORY_IDS] as const;

export type CatalogCategoryId = (typeof ALL_CATALOG_CATEGORY_IDS)[number];

export type CatalogField = {
  value?: string;
  url?: string;
  supported?: boolean;
  flag?: "positive" | "negative" | "experimental" | string;
};

export type CatalogItemFull = {
  id: string;
  name: string;
  "short-description"?: string;
  purchasable?: boolean;
  description?: string;
  "basic-information"?: Record<string, CatalogField>;
  authorship?: Record<string, CatalogField>;
  format?: Record<string, CatalogField>;
  brand?: CatalogField | string;
  [key: string]: unknown;
};

export type CatalogItemSummary = {
  id: string;
  category: CatalogCategoryId;
  name: string;
  shortDescription: string;
  author: string;
  thumb: string | null;
  image: string | null;
  purchasable: boolean;
  brand: string | null;
  custom?: boolean;
  buyLink?: string | null;
};

export type CatalogCategory = {
  id: CatalogCategoryId;
  count: number;
  sampleThumb: string | null;
  custom?: boolean;
  visual?: string | null;
  blurb?: Partial<Record<Locale, string>>;
};

export type CatalogBrandSummary = {
  id: string;
  name: string;
  headquarters?: string;
  logo: string | null;
};

export type CatalogBrandFull = {
  brand?: CatalogField;
  description?: CatalogField;
  headquarters?: CatalogField;
  website?: CatalogField;
  [key: string]: unknown;
};

export type FeatureGroup = {
  key: string;
  label: string;
  features: { key: string; label: string; value: string; flag?: string }[];
};

const SKIP_FEATURE_KEYS = new Set([
  "id",
  "name",
  "short-description",
  "description",
  "purchasable",
  "basic-information",
  "authorship",
  "custom",
  "buyLink",
  "category",
  "thumb",
  "image",
]);

const itemModules = import.meta.glob<{ default: CatalogItemFull }>(
  "../data/catalog/items/**/*.json",
  { eager: true },
);

const brandModules = import.meta.glob<{ default: CatalogBrandFull }>(
  "../data/catalog/brands/*.json",
  { eager: true },
);

function humanizeKey(key: string): string {
  return key
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fieldValue(node: CatalogField | string | undefined): string | undefined {
  if (node == null) return undefined;
  if (typeof node === "string") return node;
  return node.value;
}

function mergeItems(): CatalogItemSummary[] {
  const base = catalogIndex.items as CatalogItemSummary[];
  const customItems = (customOverlay.items ?? []) as CatalogItemSummary[];
  const byKey = new Map<string, CatalogItemSummary>();

  for (const item of base) {
    byKey.set(`${item.category}/${item.id}`, { ...item, buyLink: null });
  }

  for (const item of customItems) {
    const key = `${item.category}/${item.id}`;
    byKey.set(key, { ...byKey.get(key), ...item, custom: true });
  }

  for (const [key, href] of Object.entries(customOverlay.buyLinks ?? {})) {
    const existing = byKey.get(key);
    if (existing) existing.buyLink = href;
  }

  return [...byKey.values()];
}

const ALL_ITEMS = mergeItems();

export function isCatalogCategory(id: string): id is CatalogCategoryId {
  return (ALL_CATALOG_CATEGORY_IDS as readonly string[]).includes(id);
}

export function getCategories(): CatalogCategory[] {
  const tbh = catalogIndex.categories.map((c) => ({
    ...c,
    id: c.id as CatalogCategoryId,
  }));

  const mining = customOverlay.categories?.mining;
  if (mining) {
    tbh.push({
      id: "mining",
      count: 0,
      sampleThumb: null,
      custom: true,
      visual: mining.visual ?? "mining",
      blurb: mining.blurb,
    });
  }

  return tbh;
}

export function getCategory(id: CatalogCategoryId): CatalogCategory | undefined {
  return getCategories().find((c) => c.id === id);
}

export function categoryLabel(categoryId: CatalogCategoryId, locale: Locale): string {
  const strings = t(locale);
  const map: Record<string, string> = {
    books: strings.catBooks,
    "hardware-wallets": strings.catHardwareWallets,
    "software-wallets": strings.catSoftwareWallets,
    "bitcoin-nodes": strings.catBitcoinNodes,
    "seed-backup": strings.catSeedBackup,
    inheritance: strings.catInheritance,
    mining: strings.catMining,
  };
  return map[categoryId] ?? humanizeKey(categoryId);
}

const CATEGORY_BLURBS: Record<CatalogCategoryId, Partial<Record<Locale, string>>> = {
  books: {
    en: "Bitcoin books that explain the protocol, money, and practical strategies.",
    sq: "Libra Bitcoin që shpjegojnë protokollin, paratë dhe strategji praktike.",
  },
  "hardware-wallets": {
    en: "Offline devices for securing your private keys.",
    sq: "Pajisje offline për sigurimin e çelësave privatë.",
  },
  "software-wallets": {
    en: "Hot and cold software wallets for everyday self-custody.",
    sq: "Portofole software për self-custody të përditshme.",
  },
  "bitcoin-nodes": {
    en: "Run your own node and verify the chain independently.",
    sq: "Ekzekuto nyjen tënde dhe verifiko zinxhirin në mënyrë të pavarur.",
  },
  "seed-backup": {
    en: "Steel plates, stamps, and tools for durable seed backup.",
    sq: "Plaka çeliku dhe mjete për backup të qëndrueshëm të farës.",
  },
  inheritance: {
    en: "Plans and tools for passing Bitcoin to heirs.",
    sq: "Plani dhe mjete për t'i kaluar Bitcoin trashëgimtarëve.",
  },
  mining: {
    en: "ASIC miners and hardware — contact us for models and orders.",
    sq: "Minerë ASIC dhe hardware — na kontaktoni për modele dhe porosi.",
  },
};

export function categoryBlurb(category: CatalogCategory, locale: Locale): string {
  const custom = category.blurb?.[locale] ?? category.blurb?.en;
  if (custom) return custom;
  return CATEGORY_BLURBS[category.id]?.[locale] ?? CATEGORY_BLURBS[category.id]?.en ?? "";
}

export function getItems(category: CatalogCategoryId): CatalogItemSummary[] {
  return ALL_ITEMS.filter((i) => i.category === category);
}

export function getItem(category: CatalogCategoryId, id: string): CatalogItemSummary | undefined {
  return ALL_ITEMS.find((i) => i.category === category && i.id === id);
}

export function getItemFull(category: CatalogCategoryId, id: string): CatalogItemFull | undefined {
  const custom = (customOverlay.items ?? []).find(
    (i) => i.category === category && i.id === id,
  ) as CatalogItemFull | undefined;

  const mod = itemModules[`../data/catalog/items/${category}/${id}.json`];
  if (mod?.default) {
    return custom ? { ...mod.default, ...custom } : mod.default;
  }
  return custom;
}

export function getBrands(): CatalogBrandSummary[] {
  return catalogIndex.brands as CatalogBrandSummary[];
}

export function getBrand(id: string): CatalogBrandSummary | undefined {
  return getBrands().find((b) => b.id === id);
}

export function getBrandFull(id: string): CatalogBrandFull | undefined {
  return brandModules[`../data/catalog/brands/${id}.json`]?.default;
}

export function getBrandItems(brandId: string): CatalogItemSummary[] {
  return ALL_ITEMS.filter((i) => i.brand?.toLowerCase() === brandId.toLowerCase());
}

export function getSpotlightItems(): CatalogItemSummary[] {
  const keys = customOverlay.spotlight ?? [];
  return keys
    .map((key) => {
      const [category, id] = key.split("/");
      if (!category || !id || !isCatalogCategory(category)) return undefined;
      return getItem(category, id);
    })
    .filter((i): i is CatalogItemSummary => Boolean(i));
}

export function getRelatedItems(category: CatalogCategoryId, id: string, limit = 6): CatalogItemSummary[] {
  return getItems(category)
    .filter((i) => i.id !== id)
    .slice(0, limit);
}

export function itemPath(category: CatalogCategoryId, id: string, locale: Locale = "sq"): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${prefix}/${category}/${id}/`;
}

export function categoryPath(category: CatalogCategoryId, locale: Locale = "sq"): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${prefix}/${category}/`;
}

export function brandPath(id: string, locale: Locale = "sq"): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${prefix}/brands/${id}/`;
}

export function extractFeatureGroups(item: CatalogItemFull): FeatureGroup[] {
  const groups: FeatureGroup[] = [];

  for (const [groupKey, groupVal] of Object.entries(item)) {
    if (SKIP_FEATURE_KEYS.has(groupKey)) continue;
    if (groupVal == null || typeof groupVal !== "object" || Array.isArray(groupVal)) continue;

    const features: FeatureGroup["features"] = [];
    for (const [featKey, featVal] of Object.entries(groupVal as Record<string, CatalogField>)) {
      if (featVal == null || typeof featVal !== "object") continue;
      const value = featVal.value ?? "—";
      if (value === "-" || value === "") continue;
      features.push({
        key: featKey,
        label: humanizeKey(featKey),
        value,
        flag: featVal.flag,
      });
    }

    if (features.length > 0) {
      groups.push({ key: groupKey, label: humanizeKey(groupKey), features });
    }
  }

  return groups;
}

export function itemAuthor(item: CatalogItemFull | CatalogItemSummary): string {
  if ("author" in item && item.author) return item.author;
  const full = item as CatalogItemFull;
  return (
    fieldValue(full.authorship?.authors) ??
    fieldValue(full.authorship?.author) ??
    fieldValue(full.brand as CatalogField) ??
    ""
  );
}

export function itemBuyLink(item: CatalogItemSummary): string | null {
  return item.buyLink ?? null;
}

export function catalogStaticPaths(): { params: { category: string; id: string } }[] {
  return ALL_ITEMS.map((item) => ({
    params: { category: item.category, id: item.id },
  }));
}

export function catalogCategoryPaths(): { params: { category: string } }[] {
  return getCategories()
    .filter((c) => c.id !== "mining" || c.count > 0 || c.custom)
    .map((c) => ({ params: { category: c.id } }));
}

export function brandStaticPaths(): { params: { id: string } }[] {
  return getBrands().map((b) => ({ params: { id: b.id } }));
}
