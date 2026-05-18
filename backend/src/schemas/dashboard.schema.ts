import { z } from "zod";

export const dashboardRangeQuerySchema = z.object({
  range: z.enum(["7d", "30d"]).optional().default("7d"),
});

export type DashboardRangeQuery = z.infer<typeof dashboardRangeQuerySchema>;
