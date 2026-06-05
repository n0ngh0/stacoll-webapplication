import User from "../models/User";

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type SkillLevelName = (typeof SKILL_LEVELS)[number];

export const CERT_VALIDITY_MS = 2 * 365 * 24 * 60 * 60 * 1000;
export const GRACE_PERIOD_MS = 10 * 24 * 60 * 60 * 1000;

export interface VerifiedSkillEntry {
  skillId: { toString(): string } | string;
  skillName: string;
  level: string;
  score: number;
  verifiedAt: Date | string;
  expiresAt?: Date | string;
}

export interface SkillRenewalState {
  highestAchievedLevel: SkillLevelName | null;
  graceLevel: SkillLevelName | null;
  graceExpiresAt: Date | null;
  graceDaysRemaining: number;
  isInGracePeriod: boolean;
  mustRestartFromBeginner: boolean;
  renewTargetLevel: SkillLevelName | null;
}

export function getLevelWeight(level: string): number {
  switch (level.toLowerCase()) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    default:
      return 0;
  }
}

export function computeExpiresAt(verifiedAt: Date): Date {
  return new Date(verifiedAt.getTime() + CERT_VALIDITY_MS);
}

export function getExpiresAt(entry: VerifiedSkillEntry): Date {
  if (entry.expiresAt) {
    return new Date(entry.expiresAt);
  }
  return computeExpiresAt(new Date(entry.verifiedAt));
}

export function isEntryExpired(entry: VerifiedSkillEntry, now: Date = new Date()): boolean {
  return getExpiresAt(entry) <= now;
}

export function getGraceDeadline(entry: VerifiedSkillEntry): Date {
  return new Date(getExpiresAt(entry).getTime() + GRACE_PERIOD_MS);
}

export function entriesByLevel(
  entries: VerifiedSkillEntry[]
): Map<string, VerifiedSkillEntry> {
  const map = new Map<string, VerifiedSkillEntry>();
  for (const entry of entries) {
    map.set(entry.level.toLowerCase(), entry);
  }
  return map;
}

export function getHighestAchievedLevel(
  byLevel: Map<string, VerifiedSkillEntry>
): SkillLevelName | null {
  for (const level of [...SKILL_LEVELS].reverse()) {
    if (byLevel.has(level)) {
      return level;
    }
  }
  return null;
}

export function levelLabel(level: string): string {
  const normalized = level.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/** Level is valid when its own certificate has not expired (no lower-level chain requirement). */
export function isLevelValid(
  byLevel: Map<string, VerifiedSkillEntry>,
  level: string,
  now: Date = new Date()
): boolean {
  const normalized = level.toLowerCase();
  const entry = byLevel.get(normalized);
  if (!entry || isEntryExpired(entry, now)) {
    return false;
  }
  return true;
}

export function hasPassedLevel(
  byLevel: Map<string, VerifiedSkillEntry>,
  level: string
): boolean {
  return byLevel.has(level.toLowerCase());
}

export function getEffectiveLevel(
  entries: VerifiedSkillEntry[],
  now: Date = new Date()
): { level: SkillLevelName; entry: VerifiedSkillEntry } | null {
  const byLevel = entriesByLevel(entries);
  for (const level of [...SKILL_LEVELS].reverse()) {
    if (isLevelValid(byLevel, level, now)) {
      const entry = byLevel.get(level);
      if (entry) {
        return { level, entry };
      }
    }
  }
  return null;
}

export function getSkillRenewalState(
  entries: VerifiedSkillEntry[],
  now: Date = new Date()
): SkillRenewalState {
  const byLevel = entriesByLevel(entries);
  const highestAchievedLevel = getHighestAchievedLevel(byLevel);

  if (!highestAchievedLevel) {
    return {
      highestAchievedLevel: null,
      graceLevel: null,
      graceExpiresAt: null,
      graceDaysRemaining: 0,
      isInGracePeriod: false,
      mustRestartFromBeginner: false,
      renewTargetLevel: null,
    };
  }

  const highestEntry = byLevel.get(highestAchievedLevel)!;

  if (!isEntryExpired(highestEntry, now)) {
    return {
      highestAchievedLevel,
      graceLevel: null,
      graceExpiresAt: null,
      graceDaysRemaining: 0,
      isInGracePeriod: false,
      mustRestartFromBeginner: false,
      renewTargetLevel: null,
    };
  }

  const graceExpiresAt = getGraceDeadline(highestEntry);
  const isInGracePeriod = now < graceExpiresAt;
  const graceDaysRemaining = isInGracePeriod
    ? Math.max(1, Math.ceil((graceExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  return {
    highestAchievedLevel,
    graceLevel: isInGracePeriod ? highestAchievedLevel : null,
    graceExpiresAt: isInGracePeriod ? graceExpiresAt : null,
    graceDaysRemaining,
    isInGracePeriod,
    mustRestartFromBeginner: !isInGracePeriod,
    renewTargetLevel: isInGracePeriod ? highestAchievedLevel : "beginner",
  };
}

export function validateAssessmentAttempt(
  byLevel: Map<string, VerifiedSkillEntry>,
  targetLevel: string,
  renewalState: SkillRenewalState,
  now: Date = new Date()
): { allowed: boolean; message?: string } {
  const normalized = targetLevel.toLowerCase();

  if (isLevelValid(byLevel, normalized, now)) {
    return { allowed: false, message: "This level certificate is still valid." };
  }

  if (renewalState.isInGracePeriod && renewalState.graceLevel) {
    if (normalized === renewalState.graceLevel) {
      return { allowed: true };
    }
    return {
      allowed: false,
      message: `Your ${levelLabel(renewalState.graceLevel)} certificate is in a ${renewalState.graceDaysRemaining}-day grace period. Renew ${levelLabel(renewalState.graceLevel)} first to avoid restarting from Beginner.`,
    };
  }

  if (renewalState.mustRestartFromBeginner) {
    if (normalized === "beginner") {
      return { allowed: true };
    }
    return {
      allowed: false,
      message: "Grace period ended. You must restart from the Beginner level.",
    };
  }

  if (normalized === "intermediate" && !hasPassedLevel(byLevel, "beginner")) {
    return {
      allowed: false,
      message: "You must pass the beginner level first.",
    };
  }

  if (normalized === "advanced" && !hasPassedLevel(byLevel, "intermediate")) {
    return {
      allowed: false,
      message: "You must pass the intermediate level first.",
    };
  }

  return { allowed: true };
}

export function getSkillStatusMessage(
  entries: VerifiedSkillEntry[],
  effective: { level: SkillLevelName; entry: VerifiedSkillEntry } | null,
  renewalState: SkillRenewalState,
  now: Date = new Date()
): string {
  if (renewalState.isInGracePeriod && renewalState.graceLevel) {
    const graceLabel = levelLabel(renewalState.graceLevel);
    if (!effective || getLevelWeight(renewalState.graceLevel) > getLevelWeight(effective.level)) {
      return `${graceLabel} expired — renew within ${renewalState.graceDaysRemaining} day${renewalState.graceDaysRemaining === 1 ? "" : "s"} (no re-climb required)`;
    }
  }

  if (renewalState.mustRestartFromBeginner) {
    return "Grace period ended — start over from Beginner";
  }

  if (effective) {
    const expires = getExpiresAt(effective.entry).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return `Valid until ${expires}`;
  }

  if (entries.length === 0) {
    return "Not verified";
  }

  return "All certificates expired — renew an assessment to restore verification";
}

export function enrichVerifiedSkillEntry(
  entry: VerifiedSkillEntry,
  now: Date = new Date()
) {
  const expiresAt = getExpiresAt(entry);
  return {
    ...entry,
    skillId: entry.skillId?.toString?.() ?? entry.skillId,
    level: entry.level.toLowerCase(),
    expiresAt: expiresAt.toISOString(),
    verifiedAt: new Date(entry.verifiedAt).toISOString(),
    isExpired: isEntryExpired(entry, now),
  };
}

export function buildSkillWalletSummaries(
  verifiedSkills: VerifiedSkillEntry[] | undefined,
  now: Date = new Date()
) {
  if (!verifiedSkills?.length) {
    return [];
  }

  const grouped = new Map<string, VerifiedSkillEntry[]>();
  for (const entry of verifiedSkills) {
    const id = entry.skillId?.toString?.() ?? String(entry.skillId);
    const list = grouped.get(id) ?? [];
    list.push(entry);
    grouped.set(id, list);
  }

  const summaries = [];
  for (const [skillId, entries] of grouped) {
    const byLevel = entriesByLevel(entries);
    const effective = getEffectiveLevel(entries, now);
    const renewalState = getSkillRenewalState(entries, now);

    const levelStatus = Object.fromEntries(
      SKILL_LEVELS.map((level) => {
        const entry = byLevel.get(level);
        const isHighestGrace =
          renewalState.isInGracePeriod && renewalState.graceLevel === level;
        return [
          level,
          {
            hasCertificate: Boolean(entry),
            isValid: isLevelValid(byLevel, level, now),
            isExpired: entry ? isEntryExpired(entry, now) : false,
            expiresAt: entry ? getExpiresAt(entry).toISOString() : null,
            verifiedAt: entry ? new Date(entry.verifiedAt).toISOString() : null,
            score: entry?.score ?? null,
            isInGrace: isHighestGrace,
            graceExpiresAt: isHighestGrace
              ? renewalState.graceExpiresAt?.toISOString() ?? null
              : null,
            graceDaysRemaining: isHighestGrace ? renewalState.graceDaysRemaining : 0,
          },
        ];
      })
    );

    summaries.push({
      skillId,
      skillName: entries[0].skillName,
      effectiveLevel: effective?.level ?? null,
      effectiveScore: effective?.entry.score ?? null,
      effectiveVerifiedAt: effective
        ? new Date(effective.entry.verifiedAt).toISOString()
        : null,
      effectiveExpiresAt: effective
        ? getExpiresAt(effective.entry).toISOString()
        : null,
      isFullyExpired: effective === null && !renewalState.isInGracePeriod,
      isInGracePeriod: renewalState.isInGracePeriod,
      graceLevel: renewalState.graceLevel,
      graceExpiresAt: renewalState.graceExpiresAt?.toISOString() ?? null,
      graceDaysRemaining: renewalState.graceDaysRemaining,
      mustRestartFromBeginner: renewalState.mustRestartFromBeginner,
      renewTargetLevel: renewalState.renewTargetLevel,
      highestAchievedLevel: renewalState.highestAchievedLevel,
      statusMessage: getSkillStatusMessage(entries, effective, renewalState, now),
      levelStatus,
    });
  }

  return summaries;
}

export async function upsertVerifiedSkill(
  userId: string,
  skillId: string,
  skillName: string,
  level: string,
  score: number
) {
  const user = await User.findById(userId);
  if (!user) {
    return;
  }

  const verifiedAt = new Date();
  const expiresAt = computeExpiresAt(verifiedAt);
  const normalizedLevel = level.toLowerCase();

  user.verifiedSkills = (user.verifiedSkills ?? []).filter(
    (v) =>
      !(
        v.skillId.toString() === skillId &&
        v.level.toLowerCase() === normalizedLevel
      )
  );

  user.verifiedSkills.push({
    skillId: skillId as any,
    skillName,
    level: normalizedLevel as SkillLevelName,
    score,
    verifiedAt,
    expiresAt,
  });

  await user.save();
}
