// Map of year -> winner image path
export const winnerImageMap = {
  2024: '/christmas_winners/winner_2024.jpg',
  2023: '/christmas_winners/winner_2023.jpg',
  2022: '/christmas_winners/winner_2022.jpg',
  2021: '/christmas_winners/winner_2021.jpg',
  2020: '/christmas_winners/winner_2020.jpg',
  2016: '/christmas_winners/winner_2016.jpg',
  2015: '/christmas_winners/winner_2015.jpg',
  2013: '/christmas_winners/winner_2013.jpg',
  2012: '/christmas_winners/winner_2012.jpg',
  2008: '/christmas_winners/winner_2008.jpg',
  2007: '/christmas_winners/winner_2007.jpg',
  2001: '/christmas_winners/winner_2001.jpg',
  1997: '/christmas_winners/winner_1997.jpg',
  1994: '/christmas_winners/winner_1994.jpg',
  1993: '/christmas_winners/winner_1993.jpg',
  1992: '/christmas_winners/winner_1992.jpg',
  1991: '/christmas_winners/winner_1991.jpg',
  1990: '/christmas_winners/winner_1990.jpg',
  1989: '/christmas_winners/winner_1989.jpg',
};

// Netlify image optimization detection
const isNetlifyHost =
  typeof window !== 'undefined' &&
  (/\.netlify\.app$/.test(window.location.hostname) ||
    /maloschristmas/i.test(window.location.hostname));

export function buildImageUrl(src, { w, h, fit = 'cover', q = 70 } = {}) {
  if (!src) return '';
  if (isNetlifyHost) {
    let url = `/.netlify/images?url=${encodeURIComponent(src)}`;
    if (w) url += `&w=${w}`;
    if (h) url += `&h=${h}`;
    if (fit) url += `&fit=${fit}`;
    if (q) url += `&q=${q}`;
    return url;
  }
  const params = [];
  if (w) params.push(`w=${w}`);
  if (h) params.push(`h=${h}`);
  if (fit) params.push(`fit=${fit}`);
  if (q) params.push(`q=${q}`);
  return params.length ? `${src}?${params.join('&')}` : src;
}
export function buildSrcSet(src, widths, opts) {
  return widths.map((w) => `${buildImageUrl(src, { ...opts, w })} ${w}w`).join(', ');
}
