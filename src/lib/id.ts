import { nanoid } from "nanoid";

// Paste IDs: 7 characters (URL-friendly, ~2.2 billion combinations)
export function generatePasteId(): string {
  return nanoid(7);
}

// Delete keys: 32 characters (high entropy for security)
export function generateDeleteKey(): string {
  return nanoid(32);
}

// View keys for private pastes: 16 characters
export function generateViewKey(): string {
  return nanoid(16);
}
