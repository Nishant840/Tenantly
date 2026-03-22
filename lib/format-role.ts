const ORG_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

const PROJECT_LABELS: Record<string, string> = {
  PROJECT_ADMIN: "Project admin",
  PROJECT_MEMBER: "Member",
};

export function formatOrgRole(role: string): string {
  return ORG_LABELS[role] ?? role;
}

export function formatProjectRole(role: string): string {
  return PROJECT_LABELS[role] ?? role;
}
