# VForum

A clean, dark-themed community forum built with **Next.js (App Router)** and **Firebase** (Google sign-in + Firestore).

**Features:** Google OAuth, posts, comments, live updates, categories, ranking system with badges, responsive sidebar layout.

## Ranks

Points: **+5** per post, **+2** per comment.

| Rank | How to get it |
| --- | --- |
| Newbie | 0 points |
| Member | 25 points |
| Active | 100 points |
| Expert | 350 points |
| Moderator | Manually assigned (see below). Can delete any post or comment |
| Legend | 1000 points (overrides Moderator) |

Rank logic lives in `lib/ranks.js`. Change thresholds there.

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project.
2. **Build → Authentication → Sign-in method**: enable **Google**.
3. **Build → Firestore Database**: create a database (production mode).
4. **Project settings → Your apps → Web app (`</>`)**: register an app and copy the config values into `.env.local`:
   `apiKey`, `authDomain`, `projectId`, `appId`.
5. **Firestore → Rules**: paste the contents of `firestore.rules` and publish.

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000. Sign in, create a post, comment.

> The first load of the feed may log a Firestore index message in the console if you change queries.
> The default queries use a single field and need no custom index.

## Make someone a Moderator

In the Firestore console open `users/<uid>` and change the field `role` from `user` to `moderator`. (Users cannot change their own role; the rules block it.)

## Deploy to GitHub + Vercel

```bash
git init
git add .
git commit -m "VForum"
git branch -M main
git remote add origin https://github.com/<you>/vforum.git
git push -u origin main
```

1. On [vercel.com](https://vercel.com) click **Add New → Project** and import the repo.
2. Add the four `NEXT_PUBLIC_FIREBASE_*` variables under **Environment Variables**.
3. Deploy.
4. In Firebase **Authentication → Settings → Authorized domains**, add your Vercel domain (e.g. `vforum.vercel.app`) or Google sign-in will fail on the live site.

## Project structure

```
app/                 Routes: / , /c/[slug] , /post/[id]
components/          AuthProvider, Sidebar, Shell, Feed, NewPost, Author, RankBadge
lib/                 firebase.js, ranks.js, categories.js, time.js
firestore.rules      Security rules
```

## Production notes

- Points are updated from the client for simplicity, and the rules stop role changes but not point inflation. For a hardened setup, move point updates and `commentCount` into Cloud Functions.
- Deleting a post leaves its comments subcollection orphaned (invisible, but stored). A Cloud Function can clean these up.
- Footer text is fixed in `components/Shell.js`: `Copyright By Kia-Leader`.

## Deploy to GitHub Pages (alternative to Vercel)

1. Repo **Settings → Secrets and variables → Actions → Variables**: add the four `NEXT_PUBLIC_FIREBASE_*` as *repository variables*.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes to `https://<user>.github.io/<repo>/`.
4. Add `<user>.github.io` to Firebase **Authentication → Settings → Authorized domains**.

The post page uses `/post?id=...` (not `/post/[id]`) because GitHub Pages only serves static files.
