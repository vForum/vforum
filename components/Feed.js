"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCategory } from "@/lib/categories";
import { timeAgo } from "@/lib/time";
import { useAuth } from "./AuthProvider";
import Author from "./Author";
import NewPost from "./NewPost";

export default function Feed({ category }) {
  const { user, signIn } = useAuth();
  const [posts, setPosts] = useState(null);
  const [composing, setComposing] = useState(false);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(60)),
        (s) => setPosts(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
        () => setPosts([])
      ),
    []
  );

  const list = posts?.filter((p) => !category || p.category === category.slug);

  return (
    <>
      <div className="page-head">
        <h1>{category ? category.name : "All posts"}</h1>
        <button className="btn primary" onClick={() => (user ? setComposing(true) : signIn())}>
          New post
        </button>
      </div>

      {!list && <p className="muted">Loading posts…</p>}
      {list?.length === 0 && (
        <div className="empty">
          <b>No posts yet</b>
          <p className="muted">Start the first conversation here.</p>
        </div>
      )}

      <div className="stack">
        {list?.map((p) => (
          <Link href={`/post?id=${p.id}`} key={p.id} className="card post-card">
            <div className="meta">
              <span className="tag">{getCategory(p.category)?.name || "General"}</span>
              <span className="muted">{timeAgo(p.createdAt)}</span>
            </div>
            <h3>{p.title}</h3>
            {p.body && <p className="snippet">{p.body}</p>}
            <div className="meta between">
              <Author uid={p.authorId} name={p.authorName} photo={p.authorPhoto} />
              <span className="muted">{p.commentCount || 0} {p.commentCount === 1 ? "comment" : "comments"}</span>
            </div>
          </Link>
        ))}
      </div>

      {composing && <NewPost defaultCategory={category?.slug} onClose={() => setComposing(false)} />}
    </>
  );
}
