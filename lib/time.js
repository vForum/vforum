export function timeAgo(ts) {
  if (!ts?.toDate) return "just now";
  const s = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (s < 60) return "just now";
  for (const [u, n] of [["d", 86400], ["h", 3600], ["m", 60]]) {
    if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  }
}
