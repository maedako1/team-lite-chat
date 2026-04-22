const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

export function slugifyFromName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const slug = base.length >= 2 ? base : `ws-${base || "x"}`.slice(0, 48);
  return SLUG_RE.test(slug) ? slug : `workspace-${Date.now().toString(36)}`.slice(0, 48);
}

export function normalizeWorkspaceSlug(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export function isValidWorkspaceSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}
