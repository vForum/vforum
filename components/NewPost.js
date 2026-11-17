"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/lib/categories";
import { POINTS } from "@/lib/ranks";
import { useAuth } from "./AuthProvider";

export default function NewPost({ defaultCategory, onClose }) {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(defaultCategory || "general");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return setError("Add a title to your post.");
    setBusy(true);
    try {
      const postRef = doc(collection(db, "posts"));
      const batch = writeBatch(db);
      batch.set(postRef, {
        title: title.trim(), body: body.trim(), category,
        authorId: user.uid, authorName: user.displayName || "Anonymous", authorPhoto: user.photoURL || "",
        commentCount: 0, createdAt: serverTimestamp(),
      });
      batch.set(doc(db, "users", user.uid), { posts: increment(1), points: increment(POINTS.post) }, { merge: true });
      await batch.commit();
      onClose();
      router.push(`/post?id=${postRef.id}`);
    } catch {
      setError("Couldn't publish. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="modal-wrap" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>New post</h2>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={140} autoFocus />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's on your mind?" rows={7} maxLength={10000} />
        {error && <p className="error">{error}</p>}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? "Publishing…" : "Publish"}</button>
        </div>
      </form>
    </div>
  );
}
