"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCategory } from "@/lib/categories";
import { POINTS } from "@/lib/ranks";
import { timeAgo } from "@/lib/time";
import { useAuth } from "@/components/AuthProvider";
import Author from "@/components/Author";

function PostView() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const { user, profile, signIn } = useAuth();
  const [post, setPost] = useState(undefined); // undefined = loading, null = missing
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return setPost(null);
    return onSnapshot(doc(db, "posts", id), (s) => setPost(s.exists() ? { id: s.id, ...s.data() } : null));
  }, [id]);
  useEffect(() => {
    if (!id) return;
    return onSnapshot(query(collection(db, "posts", id, "comments"), orderBy("createdAt", "asc")), (s) =>
      setComments(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [id]);

  const canDelete = (authorId) => user && (user.uid === authorId || profile?.role === "moderator");

  async function addComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const batch = writeBatch(db);
      batch.set(doc(collection(db, "posts", id, "comments")), {
        text: text.trim(), authorId: user.uid,
        authorName: user.displayName || "Anonymous", authorPhoto: user.photoURL || "",
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, "posts", id), { commentCount: increment(1) });
      batch.set(doc(db, "users", user.uid), { comments: increment(1), points: increment(POINTS.comment) }, { merge: true });
      await batch.commit();
      setText("");
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(cid) {
    const b = writeBatch(db);
    b.delete(doc(db, "posts", id, "comments", cid));
    b.update(doc(db, "posts", id), { commentCount: increment(-1) });
    await b.commit();
  }

  async function removePost() {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", id));
    router.push("/");
  }

  if (post === undefined) return <p className="muted">Loading post…</p>;
  if (post === null)
    return (
      <div className="empty">
        <b>Post not found</b>
        <p className="muted">It may have been deleted. <Link href="/" className="link">Back to all posts</Link></p>
      </div>
    );

  return (
    <>
      <Link href="/" className="link back">← All posts</Link>
      <article className="card post-full">
        <div className="meta">
          <span className="tag">{getCategory(post.category)?.name || "General"}</span>
          <span className="muted">{timeAgo(post.createdAt)}</span>
        </div>
        <h1>{post.title}</h1>
        {post.body && <p className="body">{post.body}</p>}
        <div className="meta between">
          <Author uid={post.authorId} name={post.authorName} photo={post.authorPhoto} />
          {canDelete(post.authorId) && <button className="btn ghost danger" onClick={removePost}>Delete</button>}
        </div>
      </article>

      <h2 className="section-title">{comments.length} {comments.length === 1 ? "comment" : "comments"}</h2>

      {user ? (
        <form className="composer" onSubmit={addComment}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" rows={3} maxLength={3000} />
          <div className="row end"><button className="btn primary" disabled={busy || !text.trim()}>Comment</button></div>
        </form>
      ) : (
        <div className="empty slim">
          <button className="btn primary" onClick={signIn}>Sign in with Google</button>
          <span className="muted">to join the discussion</span>
        </div>
      )}

      <div className="stack">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="meta between">
              <span className="row gap">
                <Author uid={c.authorId} name={c.authorName} photo={c.authorPhoto} />
                <span className="muted">{timeAgo(c.createdAt)}</span>
              </span>
              {canDelete(c.authorId) && (
                <button className="btn ghost danger small" onClick={() => removeComment(c.id)}>Delete</button>
              )}
            </div>
            <p className="body">{c.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<p className="muted">Loading post…</p>}>
      <PostView />
    </Suspense>
  );
}
