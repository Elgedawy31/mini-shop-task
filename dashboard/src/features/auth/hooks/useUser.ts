import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, handleApiError } from "@/shared/services/errorHandler";
import logger from "@/shared/utils/logger";
import { AuthService } from "..";
import type { UpdateUserRequest } from "../services/authService";

/**
 * React Query hooks for user operations
 */

// Query keys
export const userKeys = {
  all: ["users"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to update user profile
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      AuthService.updateUser(id, data),
    onSuccess: (result, { id }) => {
      if (!result.success) {
        handleApiError(
          { message: result.error ?? result.message ?? "Update failed" },
          { context: "Update Profile" }
        );
        return;
      }

      logger.info("✅ User updated successfully:", result);

      if (result.user) {
        queryClient.setQueryData(userKeys.detail(id), result.user);
      }

      queryClient.invalidateQueries({ queryKey: ["auth"] });
      showSuccess(result.message ?? "Profile updated successfully!");
    },
    onError: (error: any) => {
      logger.error("❌ Error updating user:", error);
      handleApiError(error, { context: "Update Profile" });
    },
  });
}
