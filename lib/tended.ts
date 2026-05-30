// A note is "tended" when it was revisited meaningfully later than first
// publish. publishedAt is frozen at publish; updatedAt bumps on every save,
// so a gap beyond this threshold means the note was genuinely returned to,
// not just polished right after writing. Single source of truth for the rule
// shared by the homepage "tended" list and the per-note "updated" indicator.
export const TENDED_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 1 day

export function isTended(note: {
  publishedAt: Date | null;
  updatedAt: Date;
}): boolean {
  if (!note.publishedAt) return false;
  return note.updatedAt.getTime() - note.publishedAt.getTime() > TENDED_THRESHOLD_MS;
}
