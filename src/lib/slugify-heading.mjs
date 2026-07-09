/** Shared heading slug for TOC + rehype heading ids. */
export function slugifyHeading(text) {
  const base = String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || "section";
}

export function slugifyHeadingUnique(text, seen) {
  let slug = slugifyHeading(text);
  let n = seen.get(slug) ?? 0;
  seen.set(slug, n + 1);
  if (n > 0) slug = `${slug}-${n}`;
  return slug;
}
