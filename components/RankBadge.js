import { getRank } from "@/lib/ranks";

export default function RankBadge({ user }) {
  const r = getRank(user);
  return (
    <span className="badge" style={{ "--c": r.color }} title={`${user?.points || 0} points`}>
      {r.name}
    </span>
  );
}
