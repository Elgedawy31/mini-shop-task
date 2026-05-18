import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError, showSuccess } from "@/shared/services/errorHandler";
import { FullScreenLoader } from "@/shared/components/molecules/FullScreenLoader";
import type { SetupAdminFormData } from "..";
import SetupTemplate from "../components/SetupTemplate";
import { useSetupAdmin, useSetupStatus } from "../hooks/useAuth";

function SetupPage() {
  const navigate = useNavigate();
  const { data: status, isLoading, isError, error } = useSetupStatus();
  const setupMutation = useSetupAdmin();

  useEffect(() => {
    if (!isLoading && status && !status.needsSetup) {
      navigate("/sign-in", { replace: true });
    }
  }, [isLoading, status, navigate]);

  const onSubmit = async (data: SetupAdminFormData) => {
    try {
      await setupMutation.mutateAsync(data);
      showSuccess("Admin account created. Welcome!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      handleApiError(err, { context: "Admin setup" });
    }
  };

  if (isLoading) {
    return <FullScreenLoader message="Checking shop setup…" />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-destructive text-sm">
          {error instanceof Error
            ? error.message
            : "Could not reach the API. Is the backend running?"}
        </p>
      </div>
    );
  }

  if (!status?.needsSetup) {
    return <FullScreenLoader message="Redirecting to sign in…" />;
  }

  return <SetupTemplate onSubmit={onSubmit} isPending={setupMutation.isPending} />;
}

export default SetupPage;
