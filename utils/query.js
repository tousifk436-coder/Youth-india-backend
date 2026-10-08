/**
 * Query helpers shared by all list endpoints.
 */
const MAX_LIMIT = Number(process.env.MAX_PAGE_LIMIT) || 100;

/** page / limit / skip with sane bounds (limit is capped at MAX_PAGE_LIMIT) */
export const getPaging = (query = {}) => {
  const isPagination = String(query.isPagination ?? "true") !== "false";
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), MAX_LIMIT);
  return { isPagination, page, limit, skip: (page - 1) * limit };
};

export const pageMeta = (total, { isPagination, page, limit }) => ({
  totalPages: isPagination ? Math.ceil(total / limit) : 1,
  currentPage: isPagination ? page : 1,
  limit: isPagination ? limit : total,
});

/** Apply skip/limit to a mongoose query when pagination is on */
export const paginate = (query, paging) =>
  paging.isPagination ? query.skip(paging.skip).limit(paging.limit) : query;

/** true when the request carries a valid Admin / SuperAdmin token (see optionalAuth) */
export const isAdminRequest = (req) => ["Admin", "SuperAdmin"].includes(req.user?.role);

/**
 * Website visitors only see active items. Admins see everything and may
 * filter with ?isActive=true|false.
 */
export const applyActiveFilter = (req, filter = {}) => {
  const { isActive } = req.query;
  if (isAdminRequest(req)) {
    if (isActive === "true" || isActive === "false") filter.isActive = isActive === "true";
  } else {
    filter.isActive = { $ne: false };
  }
  return filter;
};

/** Escape user text before using it inside a RegExp (prevents ReDoS / regex errors) */
export const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const searchRegex = (s) => ({ $regex: escapeRegex(String(s).trim()), $options: "i" });

/** Parse a date safely – returns undefined for empty / invalid input */
export const toDate = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

/** Copy only allowed keys that were actually sent */
export const pick = (body = {}, keys = []) =>
  keys.reduce((o, k) => {
    if (body[k] !== undefined) o[k] = body[k];
    return o;
  }, {});

/** "true"/"false"/true/false/1/0 -> boolean (undefined stays undefined) */
export const toBool = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "boolean") return v;
  return ["true", "1", "yes", "on"].includes(String(v).toLowerCase());
};

/** Remove keys whose value is undefined (so updates do not overwrite with undefined) */
export const clean = (o) => {
  Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]);
  return o;
};
