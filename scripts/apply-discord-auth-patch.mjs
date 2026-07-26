import { readFileSync, writeFileSync } from "node:fs";

function replaceOnce(path, before, after) {
  const current = readFileSync(path, "utf8");
  if (current.includes(after)) {
    return;
  }
  if (!current.includes(before)) {
    throw new Error(`Expected source block not found in ${path}`);
  }
  writeFileSync(path, current.replace(before, after), "utf8");
}

replaceOnce(
  "src/lib/ottAuth.ts",
  'export type OttAuthProvider = "google" | "apple" | "azure" | "github";',
  'export type OttAuthProvider = "google" | "apple" | "azure" | "github" | "discord";',
);

replaceOnce(
  "src/lib/ottAuth.ts",
  `  {
    id: "github",
    label: "GitHub",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_GITHUB_ENABLED"),
    configurationKey: "VITE_AUTH_GITHUB_ENABLED",
  },
];`,
  `  {
    id: "github",
    label: "GitHub",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_GITHUB_ENABLED"),
    configurationKey: "VITE_AUTH_GITHUB_ENABLED",
  },
  {
    id: "discord",
    label: "Discord",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_DISCORD_ENABLED"),
    configurationKey: "VITE_AUTH_DISCORD_ENABLED",
  },
];`,
);

replaceOnce(
  "src/lib/ottAuth.ts",
  `  const providerOptions = provider === "azure"
    ? {
        redirectTo: getRedirectUrl(),
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      }
    : {
        redirectTo: getRedirectUrl(),
        queryParams: { prompt: "select_account" },
      };`,
  `  const providerOptions = provider === "azure"
    ? {
        redirectTo: getRedirectUrl(),
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      }
    : provider === "discord"
      ? {
          redirectTo: getRedirectUrl(),
          scopes: "identify email",
        }
      : provider === "google"
        ? {
            redirectTo: getRedirectUrl(),
            queryParams: { prompt: "select_account" },
          }
        : {
            redirectTo: getRedirectUrl(),
          };`,
);

replaceOnce(
  "src/tabs/WalletTab.tsx",
  `  Mail,
  RefreshCcw,`,
  `  Mail,
  MessageCircle,
  RefreshCcw,`,
);

replaceOnce(
  "src/tabs/WalletTab.tsx",
  `  azure: Building2,
  github: Github,
};`,
  `  azure: Building2,
  github: Github,
  discord: MessageCircle,
};`,
);

console.log("Discord authentication patch applied.");
