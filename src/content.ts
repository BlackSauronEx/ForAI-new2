import ANSWER_MD from "../docs/ANSWER.md?raw";

// Single source of truth for the preview text is docs/ANSWER.md.
// Bump this when the answer changes so stale localStorage copies are ignored.
export const CONTENT_VERSION = "2026-09-26-round-20";

export const DEFAULT_CONTENT = ANSWER_MD;
