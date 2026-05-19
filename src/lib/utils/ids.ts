export function normalizeInviteCode(code: string): string {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORGANIZATION_PREFIX_STOP_WORDS = new Set(["A", "AN", "AND", "OF", "SCHOOL", "THE"]);

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

export function inviteCodePrefix(value: string): string {
  const words = value.toUpperCase().match(/[A-Z0-9]+/g) ?? [];
  const meaningfulWord = words.find((word) => word.length >= 3 && !ORGANIZATION_PREFIX_STOP_WORDS.has(word));
  const base = meaningfulWord ?? words.find((word) => word.length >= 3) ?? "SCHOOL";
  return base.slice(0, 8);
}

export function generatedInviteCode(organizationName: string): string {
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return `${inviteCodePrefix(organizationName)}${suffix}`;
}
