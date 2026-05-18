import { AuthService } from "./authService";
import { getOAuthRedirectUrl, isSupabaseConfigured, supabase } from "@/shared/lib/supabase";

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Google sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to dashboard/.env.development."
    );
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getOAuthRedirectUrl(),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function completeGoogleOAuthCallback(): Promise<{
  success: boolean;
  error?: string;
}> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const oauthError = params.get("error_description") ?? params.get("error");

  if (oauthError) {
    return { success: false, error: oauthError };
  }

  if (!code) {
    return { success: false, error: "Missing authorization code from Google." };
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return {
      success: false,
      error: error?.message ?? "Could not complete Google sign-in.",
    };
  }

  AuthService.setAuthToken(data.session.access_token);

  const verified = await AuthService.verifyUser();

  if (!verified.success || !verified.user) {
    AuthService.clearAuthData();
    return {
      success: false,
      error: verified.error ?? "Could not verify your account.",
    };
  }

  if (verified.user.role !== "admin") {
    await supabase.auth.signOut();
    AuthService.clearAuthData();
    return {
      success: false,
      error: "This dashboard is for admin accounts only.",
    };
  }

  return { success: true };
}
