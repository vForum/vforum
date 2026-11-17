// Points: 5 per post, 2 per comment.
export const POINTS = { post: 5, comment: 2 };

export const RANKS = [
  { name: "Newbie", min: 0, color: "#9ca3af" },
  { name: "Member", min: 25, color: "#34d399" },
  { name: "Active", min: 100, color: "#60a5fa" },
  { name: "Expert", min: 350, color: "#c4a1ff" },
  { name: "Moderator", min: null, color: "#fb923c" }, // assigned via role
  { name: "Legend", min: 1000, color: "#fbbf24" },
];

const byName = (n) => RANKS.find((r) => r.name === n);
const LADDER = RANKS.filter((r) => r.min !== null);

export function getRank(user) {
  const pts = user?.points || 0;
  if (pts >= byName("Legend").min) return byName("Legend");
  if (user?.role === "moderator") return byName("Moderator");
  return [...LADDER].reverse().find((r) => pts >= r.min) || RANKS[0];
}

export function getProgress(user) {
  const pts = user?.points || 0;
  const next = LADDER.find((r) => r.min > pts);
  if (!next) return { next: null, pct: 100 };
  const prev = [...LADDER].reverse().find((r) => r.min <= pts);
  return { next, pct: Math.round(((pts - prev.min) / (next.min - prev.min)) * 100) };
}
