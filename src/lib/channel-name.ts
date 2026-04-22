const CHANNEL_RE = /^[a-z0-9][a-z0-9-]{0,78}$/;

export function isValidChannelName(name: string): boolean {
  return CHANNEL_RE.test(name);
}

export function normalizeChannelName(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#/, "").replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");
}
