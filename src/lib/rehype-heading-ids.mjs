import { slugifyHeadingUnique } from "./slugify-heading.mjs";

function visit(node, test, visitor) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) visit(child, test, visitor);
    return;
  }
  if (node.type === test || node.tagName === test) visitor(node);
  const children = node.children;
  if (Array.isArray(children)) {
    for (const child of children) visit(child, test, visitor);
  }
}

function textContent(node) {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  if (Array.isArray(node.children)) return node.children.map(textContent).join("");
  return "";
}

/** Adds stable id attributes to h2/h3 for TOC anchors. */
export function rehypeHeadingIds() {
  const seen = new Map();
  return (tree) => {
    seen.clear();
    visit(tree, "element", (node) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      if (node.properties?.id) return;
      const text = textContent(node).trim();
      if (!text) return;
      node.properties = node.properties ?? {};
      node.properties.id = slugifyHeadingUnique(text, seen);
    });
  };
}
