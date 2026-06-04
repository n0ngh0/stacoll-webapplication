const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= PASSWORD_MIN_LENGTH, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` },
  { test: (p: string) => p.length <= PASSWORD_MAX_LENGTH, message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters` },
  { test: (p: string) => /[a-z]/.test(p), message: "Password must include a lowercase letter" },
  { test: (p: string) => /[A-Z]/.test(p), message: "Password must include an uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p), message: "Password must include a number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), message: "Password must include a special character" },
] as const;

export function validatePassword(password: string): { valid: true } | { valid: false; message: string } {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return { valid: false, message: rule.message };
    }
  }
  return { valid: true };
}

export const PASSWORD_POLICY_HINT =
  "At least 8 characters with uppercase, lowercase, a number, and a special character.";
