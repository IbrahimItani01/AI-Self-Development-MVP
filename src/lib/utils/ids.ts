export function normalizeInviteCode(code: string): string {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function randomCode(prefix = "SCHOOL"): string {
  return `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
