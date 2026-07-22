import {
  createClient,
  type AuthChangeEvent,
  type Provider,
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

export type OttAuthProvider = "google" | "apple" | "azure" | "github";

export type OttAuthProviderOption = {
  id: OttAuthProvider;
  label: string;
  enabled: boolean;
  configurationKey: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "";

function envFlag(name: string) {
  const value = String(import.meta.env[name] ?? "").trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === "on";
}

export const isOttAuthConfigured = Boolean(supabaseUrl && supabaseKey);

export const OTT_AUTH_PROVIDER_OPTIONS: OttAuthProviderOption[] = [
  {
    id: "google",
    label: "Google",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_GOOGLE_ENABLED"),
    configurationKey: "VITE_AUTH_GOOGLE_ENABLED",
  },
  {
    id: "apple",
    label: "Apple",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_APPLE_ENABLED"),
    configurationKey: "VITE_AUTH_APPLE_ENABLED",
  },
  {
    id: "azure",
    label: "Microsoft",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_MICROSOFT_ENABLED"),
    configurationKey: "VITE_AUTH_MICROSOFT_ENABLED",
  },
  {
    id: "github",
    label: "GitHub",
    enabled: isOttAuthConfigured && envFlag("VITE_AUTH_GITHUB_ENABLED"),
    configurationKey: "VITE_AUTH_GITHUB_ENABLED",
  },
];

export function getEnabledOttAuthProviders() {
  return OTT_AUTH_PROVIDER_OPTIONS.filter((provider) => provider.enabled);
}

export function isOttAuthProviderEnabled(provider: OttAuthProvider) {
  return Boolean(OTT_AUTH_PROVIDER_OPTIONS.find((option) => option.id === provider)?.enabled);
}

export const ottSupabase: SupabaseClient | null = isOttAuthConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

function requireClient() {
  if (!ottSupabase) {
    throw new Error(
      "OTT account login is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.",
    );
  }

  return ottSupabase;
}

function getRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}${window.location.pathname}`;
}

export function getFriendlyOttAuthError(error: unknown, language: "en" | "nl") {
  const fallback = language === "en" ? "The account action failed." : "De accountactie is mislukt.";
  const raw = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";
  const message = raw.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return language === "en"
      ? "The email address or password is incorrect."
      : "Het e-mailadres of wachtwoord is onjuist.";
  }
  if (message.includes("email not confirmed")) {
    return language === "en"
      ? "Confirm your email address before signing in."
      : "Bevestig eerst je e-mailadres voordat je inlogt.";
  }
  if (message.includes("user already registered")) {
    return language === "en"
      ? "An account already exists for this email address."
      : "Er bestaat al een account voor dit e-mailadres.";
  }
  if (message.includes("provider") && message.includes("enabled")) {
    return language === "en"
      ? "This login provider has not been activated yet."
      : "Deze inlogprovider is nog niet geactiveerd.";
  }
  if (message.includes("rate limit")) {
    return language === "en"
      ? "Too many attempts. Wait a moment and try again."
      : "Te veel pogingen. Wacht even en probeer het opnieuw.";
  }

  return raw || fallback;
}

export async function getOttSession() {
  if (!ottSupabase) {
    return null;
  }

  const { data, error } = await ottSupabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
}

export function subscribeToOttAuth(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!ottSupabase) {
    return () => undefined;
  }

  const {
    data: { subscription },
  } = ottSupabase.auth.onAuthStateChange(callback);

  return () => subscription.unsubscribe();
}

export async function signUpOttAccount(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: getRedirectUrl(),
      data: {
        display_name: input.displayName.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInOttAccount(email: string, password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInOttProvider(provider: OttAuthProvider) {
  if (!isOttAuthProviderEnabled(provider)) {
    throw new Error("This login provider is not enabled.");
  }

  const client = requireClient();
  const providerOptions = provider === "azure"
    ? {
        redirectTo: getRedirectUrl(),
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      }
    : {
        redirectTo: getRedirectUrl(),
        queryParams: { prompt: "select_account" },
      };

  const { data, error } = await client.auth.signInWithOAuth({
    provider: provider as Provider,
    options: providerOptions,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function resetOttPassword(email: string) {
  const client = requireClient();
  const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getRedirectUrl(),
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOttDisplayName(displayName: string) {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser({
    data: { display_name: displayName.trim() },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOutOttAccount() {
  const client = requireClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export function getOttAccountName(user: User | null) {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    metadata.preferred_username,
  ];
  const found = candidates.find((value) => typeof value === "string" && value.trim());

  return typeof found === "string" ? found.trim() : user.email?.split("@")[0] ?? "OTT member";
}
