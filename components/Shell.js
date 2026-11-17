"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Shell({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-col">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <b>VForum</b>
        </header>
        <main className="main">
          <div className="container">{children}</div>
        </main>
        <footer className="footer">Copyright By Kia-Leader</footer>
      </div>
    </div>
  );
}
