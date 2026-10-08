/**
 * Media helpers – one place that understands every way the admin panel /
 * Postman may send pictures & videos, and turns them into the stored shape:
 *   attachments: [{ documentType: "image" | "video" | "file", urls: [String] }]
 */

const VIDEO_RE = /(youtube\.com\/(watch|embed|shorts|live)|youtu\.be\/|vimeo\.com\/|\.(mp4|webm|mov|m3u8)(\?|#|$))/i;
const FILE_RE = /\.(pdf|docx?|xlsx?|pptx?|zip)(\?|$)/i;

export const isVideoUrl = (u = "") => VIDEO_RE.test(String(u));
export const isYouTube = (u = "") => /(youtube\.com|youtu\.be)\//i.test(String(u));

const toList = (v) => {
  if (v === undefined || v === null || v === "") return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    // allow "url1, url2" or a JSON string coming from form-data
    const s = v.trim();
    if (s.startsWith("[")) {
      try { return JSON.parse(s); } catch { /* fall through */ }
    }
    return s.split(/\s*,\s*/).filter(Boolean);
  }
  return [v];
};

const urlOf = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x.trim();
  return String(x.url || x.secure_url || x.imageUrl || x.src || x.link || "").trim();
};

/**
 * Accepts any of:
 *   attachments: [{documentType, urls}]            (stored shape)
 *   attachments: ["url1", "url2"]                  (Postman sample)
 *   images: [...], videos: [...], files: [...]     (simple arrays)
 * Returns the stored shape, or undefined when nothing media-related was sent
 * (so an update does not wipe existing pictures).
 */
export const normalizeAttachments = (body = {}) => {
  const has = ["attachments", "images", "videos", "files"].some((k) => body[k] !== undefined);
  if (!has) return undefined;

  const buckets = { image: [], video: [], file: [] };
  const push = (type, u) => { if (u && buckets[type] && !buckets[type].includes(u)) buckets[type].push(u); };
  const guess = (u) => (isVideoUrl(u) ? "video" : FILE_RE.test(u) ? "file" : "image");

  for (const a of toList(body.attachments)) {
    if (a && typeof a === "object" && Array.isArray(a.urls)) {
      const t = ["image", "video", "file"].includes(a.documentType) ? a.documentType : null;
      a.urls.map(urlOf).filter(Boolean).forEach((u) => push(t || guess(u), u));
    } else {
      const u = urlOf(a);
      const t = a && typeof a === "object" && ["image", "video", "file"].includes(a.documentType) ? a.documentType : guess(u);
      if (u) push(t, u);
    }
  }
  toList(body.images).map(urlOf).forEach((u) => push("image", u));
  toList(body.videos).map(urlOf).forEach((u) => push("video", u));
  toList(body.files).map(urlOf).forEach((u) => push("file", u));

  return Object.entries(buckets)
    .filter(([, urls]) => urls.length)
    .map(([documentType, urls]) => ({ documentType, urls }));
};

/** All URLs of one type from the stored attachments array */
export const urlsOfType = (attachments = [], type) =>
  (attachments || [])
    .filter((a) => a && a.documentType === type)
    .flatMap((a) => a.urls || [])
    .filter(Boolean);

/** Plain list of URLs from a body value (array, "a,b" string or single url) */
export const urlList = (v) => toList(v).map(urlOf).filter(Boolean);
