import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeGoogleOAuthCallback } from "../services/googleAuth";
import { FullScreenLoader } from "@/shared/components/molecules/FullScreenLoader";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import logger from "@/shared/utils/logger";

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing Google sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await completeGoogleOAuthCallback();

        if (cancelled) return;

        if (!result.success) {
          setMessage(result.error ?? "Sign-in failed");
          handleApiError(new Error(result.error ?? "Google sign-in failed"), {
            context: "Google OAuth",
          });
          setTimeout(() => navigate("/sign-in", { replace: true }), 1500);
          return;
        }

        showSuccess("Signed in with Google");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        if (cancelled) return;
        logger.error("Google OAuth callback failed:", error);
        setMessage("Sign-in failed");
        handleApiError(error, { context: "Google OAuth" });
        setTimeout(() => navigate("/sign-in", { replace: true }), 1500);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <FullScreenLoader message={message} />;
}

export default OAuthCallbackPage;
