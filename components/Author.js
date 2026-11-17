"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import RankBadge from "./RankBadge";

const cache = new Map();
const load = (uid) => {
  if (!cache.has(uid))
    cache.set(
      uid,
      getDoc(doc(db, "users", uid)).then((s) => (s.exists() ? s.data() : null)).catch(() => null)
    );
  return cache.get(uid);
};

export function Avatar({ name, photo, size = 28 }) {
  const style = { width: size, height: size, fontSize: size * 0.45 };
  return photo ? (
    <img className="avatar" src={photo} alt="" style={style} referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar" style={style}>{(name || "?")[0].toUpperCase()}</span>
  );
}

export default function Author({ uid, name, photo }) {
  const { profile } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let on = true;
    load(uid).then((d) => on && setData(d));
    return () => { on = false; };
  }, [uid]);

  const u = profile?.id === uid ? profile : data;
  return (
    <span className="author">
      <Avatar name={name} photo={photo} />
      <b>{name}</b>
      <RankBadge user={u} />
    </span>
  );
}
