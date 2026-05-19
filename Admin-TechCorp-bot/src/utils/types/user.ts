export const UserRole = {
  ADMIN_SYSTEM: "ADMIN_SYSTEM",
  ADMIN: "ADMIN",
  BUSINESS: "BUSINESS",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];