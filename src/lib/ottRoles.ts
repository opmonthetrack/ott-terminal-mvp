import type { User } from "@supabase/supabase-js";

export type OttRole = "public" | "member" | "founder" | "admin";

const FOUNDER_ROLES = new Set<OttRole>(["founder", "admin"]);

function normalizeRole(value: unknown): OttRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const role = value.trim().toLowerCase();
  if (role === "founder" || role === "admin" || role === "member" || role === "public") {
    return role;
  }

  return null;
}

export function getOttRole(user: User | null): OttRole {
  if (!user) {
    return "public";
  }

  const appMetadata = user.app_metadata ?? {};
  const trustedRole = normalizeRole(appMetadata.ott_role) ?? normalizeRole(appMetadata.role);

  return trustedRole ?? "member";
}

export function hasFounderAccess(user: User | null) {
  return FOUNDER_ROLES.has(getOttRole(user));
}

export function getOttRoleLabel(role: OttRole, language: "en" | "nl") {
  const labels: Record<OttRole, { en: string; nl: string }> = {
    public: { en: "Public visitor", nl: "Publieke bezoeker" },
    member: { en: "Free OTT account", nl: "Gratis OTT-account" },
    founder: { en: "Founder", nl: "Founder" },
    admin: { en: "Administrator", nl: "Beheerder" },
  };

  return labels[role][language];
}
