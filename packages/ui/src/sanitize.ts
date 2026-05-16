/**
 * Data-hygiene helpers applied at primitive level.
 *
 * Enforces [LL §13.5] Source-label hygiene: absolute paths and machine
 * identifiers must never reach a user-visible surface. Strips at the
 * primitive boundary so callers cannot accidentally leak.
 */

const ABSOLUTE_PATH_PREFIXES = [
  /^\/Users\/[^/]+\//,
  /^\/home\/[^/]+\//,
  /^\/private\/var\//,
  /^\/var\//,
  /^\/tmp\//,
  /^[A-Z]:\\Users\\[^\\]+\\/i,
];

/**
 * If `value` looks like an absolute path containing a user-identifying
 * segment, return just its trailing basename. Otherwise return value
 * unchanged. Safe to call on any string — non-path inputs pass through.
 */
export function stripAbsolutePath(value: string): string {
  if (!value) return value;
  for (const prefix of ABSOLUTE_PATH_PREFIXES) {
    if (prefix.test(value)) {
      const lastSlash = Math.max(value.lastIndexOf("/"), value.lastIndexOf("\\"));
      if (lastSlash >= 0 && lastSlash < value.length - 1) {
        return value.slice(lastSlash + 1);
      }
    }
  }
  return value;
}
