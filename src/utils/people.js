export function personToSlug(name = '') {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function matchPersonByParam(allPeople, param) {
  if (!param) return null;
  const decoded = decodeURIComponent(param).trim();
  if (!decoded) return null;
  // Exact match first
  if (allPeople.includes(decoded)) return decoded;
  // Case-insensitive match
  const ci = allPeople.find((p) => p.toLowerCase() === decoded.toLowerCase());
  if (ci) return ci;
  // Interpret as slug
  const slug = decoded.toLowerCase();
  const slugMap = new Map(allPeople.map((p) => [personToSlug(p), p]));
  if (slugMap.has(slug)) return slugMap.get(slug);
  return null;
}
