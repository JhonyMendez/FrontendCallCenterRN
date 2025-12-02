export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  FUNCIONARIO: 3,
} as const;

export type RolId = typeof ROLES[keyof typeof ROLES];
