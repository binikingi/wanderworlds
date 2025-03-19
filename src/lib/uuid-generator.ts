
/**
 * Simple custom UUID generator that creates unique identifiers
 * This is a simplified version and not as collision-resistant as the real uuid library
 */
export function generateUUID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const secondRandomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}-${secondRandomPart}`;
}
