import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";

export function mapAuthError(error: AuthError | null): string {
  if (!error) return "";
  const m = error.message.toLowerCase();
  if (m.includes("not confirmed")) return "Please confirm your email, then sign in.";
  if (m.includes("invalid login")) return "That email or password doesn't look right.";
  if (m.includes("already registered")) return "An account with this email already exists.";
  if (m.includes("email") && m.includes("invalid")) return "Please enter a valid email address.";
  if (m.includes("password")) return "Password must be at least 6 characters.";
  return "Something went wrong. Please try again.";
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { name } },
  });
  // When email confirmation is enabled, signUp succeeds but session is null
  // until the user confirms — callers must branch on `session`.
  return { error, session: data.session };
}

export async function signOut() {
  await supabase.auth.signOut();
}
