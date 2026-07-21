export type OttCustomerProfile = {
  walletAddress: string;
  displayName: string;
  handle: string;
  bio: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "ott-customer-profiles-v1";

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function readProfiles() {
  if (typeof window === "undefined") {
    return {} as Record<string, OttCustomerProfile>;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue
      ? (JSON.parse(rawValue) as Record<string, OttCustomerProfile>)
      : {};
  } catch {
    return {} as Record<string, OttCustomerProfile>;
  }
}

export function loadCustomerProfile(walletAddress: string) {
  if (!isLikelyXrplAddress(walletAddress)) {
    return null;
  }

  return readProfiles()[walletAddress] ?? null;
}

export function saveCustomerProfile(input: {
  walletAddress: string;
  displayName: string;
  handle: string;
  bio: string;
}) {
  if (!isLikelyXrplAddress(input.walletAddress)) {
    throw new Error("Connect a verified XRPL wallet before creating a profile.");
  }

  const displayName = input.displayName.trim().slice(0, 40);
  const handle = input.handle.trim().replace(/^@/, "").slice(0, 32);
  const bio = input.bio.trim().slice(0, 160);

  if (displayName.length < 2) {
    throw new Error("Profile name must contain at least 2 characters.");
  }

  const profiles = readProfiles();
  const existing = profiles[input.walletAddress];
  const now = Date.now();
  const profile: OttCustomerProfile = {
    walletAddress: input.walletAddress,
    displayName,
    handle,
    bio,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  profiles[input.walletAddress] = profile;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  window.dispatchEvent(new CustomEvent("ott-profile-changed", { detail: profile }));

  return profile;
}
