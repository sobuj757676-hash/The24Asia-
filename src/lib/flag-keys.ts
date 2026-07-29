/** Feature flag keys (pure constants, safe to import anywhere). */
export const FLAGS = {
  DONATIONS_PAYMENT: "donations.payment",
  RECURRING_DONATIONS: "donations.recurring",
  MERCH_PAYMENT: "merch.payment",
  SUPPORT_INTAKE: "support.public_intake",
  COMMUNITY: "community.enabled",
  PUSH_NOTIFICATIONS: "notifications.push",
} as const;

export type FlagKey = (typeof FLAGS)[keyof typeof FLAGS];
