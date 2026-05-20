export function cleanAIGeneratedText(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .replace(/\r\n/g, "\n")
    .replace(/\*\*/g, "")
    .replace(/^\s*(summary|ai summary|suggested next step|next step)\s*:\s*/i, "")
    .replace(/^\s*(summary|ai summary|suggested next step|next step)\s*:\s*/i, "")
    .replace(/\n+\s*(summary|ai summary|suggested next step|next step)\s*:\s*/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
