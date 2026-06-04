export const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type SkillLevelName = (typeof SKILL_LEVELS)[number];

export const CERT_VALIDITY_MS = 2 * 365 * 24 * 60 * 60 * 1000;
export const GRACE_PERIOD_MS = 10 * 24 * 60 * 60 * 1000;

export interface VerifiedSkillEntry {
  skillId: string;
  skillName: string;
  level: string;
  score: number;
  verifiedAt: string;
  expiresAt?: string;
  isExpired?: boolean;
}

export interface SkillRenewalState {
  highestAchievedLevel: SkillLevelName | null;
  graceLevel: SkillLevelName | null;
  graceExpiresAt: string | null;
  graceDaysRemaining: number;
  isInGracePeriod: boolean;
  mustRestartFromBeginner: boolean;
  renewTargetLevel: SkillLevelName | null;
}

export interface SkillWalletSummary {
  skillId: string;
  skillName: string;
  effectiveLevel: SkillLevelName | null;
  effectiveScore: number | null;
  effectiveVerifiedAt: string | null;
  effectiveExpiresAt: string | null;
  isFullyExpired: boolean;
  isInGracePeriod: boolean;
  graceLevel: SkillLevelName | null;
  graceExpiresAt: string | null;
  graceDaysRemaining: number;
  mustRestartFromBeginner: boolean;
  renewTargetLevel: SkillLevelName | null;
  highestAchievedLevel: SkillLevelName | null;
  statusMessage: string;
  levelStatus: Record<
    SkillLevelName,
    {
      hasCertificate: boolean;
      isValid: boolean;
      isExpired: boolean;
      expiresAt: string | null;
      verifiedAt: string | null;
      score: number | null;
      isInGrace?: boolean;
      graceExpiresAt?: string | null;
      graceDaysRemaining?: number;
    }
  >;
}

export function getLevelWeight(level: string): number {
  switch (level.toUpperCase()) {
    case "BEGINNER":
      return 1;
    case "INTERMEDIATE":
      return 2;
    case "ADVANCED":
      return 3;
    default:
      return 0;
  }
}

export function levelLabel(level: string): string {
  const normalized = level.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatCertDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function buildSkillWalletFromProfile(user: {
  skillWallet?: SkillWalletSummary[];
  verifiedSkills?: VerifiedSkillEntry[];
}): SkillWalletSummary[] {
  if (user.skillWallet?.length) {
    return user.skillWallet;
  }
  return [];
}

export function getWalletEntry(
  wallet: SkillWalletSummary[],
  skillId: string
): SkillWalletSummary | undefined {
  return wallet.find((w) => String(w.skillId) === String(skillId));
}
