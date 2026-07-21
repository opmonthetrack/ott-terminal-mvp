import {
  createClient,
  type AuthChangeEvent,
  type Provider,
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

export type OttAuthProvider = "google" | "apple" | "azure" | "github";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "";

export const isOttAuthConfigured = Boolean(supabaseUrl && supabaseKey);

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
