export function uuid() {
  // Good enough for personal app IDs
  return crypto.randomUUID();
}
