/**
 * Adds rel="sponsored noopener noreferrer" to /go/* affiliate links in markdown output.
 */
export function rehypeAffiliateLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !href.startsWith("/go/")) return;
      const existing = String(node.properties.rel ?? "")
        .split(/\s+/)
        .filter(Boolean);
      const rel = new Set([...existing, "sponsored", "noopener", "noreferrer"]);
      node.properties.rel = [...rel].join(" ");
    });
  };
}

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
