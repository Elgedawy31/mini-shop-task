export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

export function parsePagination(
  pageRaw: number | undefined,
  limitRaw: number | undefined,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, pageRaw ?? 1);
  const limit = Math.min(maxLimit, Math.max(1, limitRaw ?? 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
