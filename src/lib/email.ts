const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Simple client-side format check for inline helper text; the server (Better Auth) does the real validation. */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}
