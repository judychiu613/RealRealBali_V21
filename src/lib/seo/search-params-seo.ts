/** 从查询串中移除常见营销参数，用于 canonical / hreflang，避免重复收录 */
const MARKETING_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "_ga",
  "ref",
  "yclid",
  "mc_eid",
]);

export function stripMarketingParamsFromSearch(search: string): string {
  if (!search || search === "?") return "";
  const q = search.startsWith("?") ? search.slice(1) : search;
  const u = new URLSearchParams(q);
  MARKETING_KEYS.forEach((k) => u.delete(k));
  const s = u.toString();
  return s ? `?${s}` : "";
}

export function nextSearchParamsToQueryString(
  sp: { [key: string]: string | string[] | undefined } | undefined
): string {
  if (!sp || Object.keys(sp).length === 0) return "";
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((x) => u.append(k, x));
    else u.set(k, v);
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}
