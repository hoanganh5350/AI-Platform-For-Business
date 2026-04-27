export const UserRole = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
  GUEST: "guest",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];