# 🎬 Movie Web App (Connected to MovieDB API)

An example project of a movie web app built using:

- **Next.js 14** (with **React 18**)
- Integrated with the **MovieDB API**
- Includes both **client-rendered pages** and an **ISG** (Incremental Static Generation) page

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

The app runs on:  
**http://localhost:3000**

> 🔐 **Important:**  
> To use the API, you must generate your own TMDB API key and add it to a `.env.local` file:

```
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

---

## 🧪 Testing

```bash
# End-to-end tests (Playwright)
npm run test

# Unit tests (Jest)
npm run jest
```

---

## 🧼 Linting and Type Checking

```bash
npm run lint
npm run tsc
```

---

## 💭 Thoughts & Design Decisions

- I **could have used TMDB’s built-in watchlist and review system**, but:
  > I wanted the app to have its own identity and meaningful user experience — not just piggyback off TMDB’s login.

- I stayed with **Next.js 14 and React 18**, even though:
  > React 19 (stable Dec 2024) and the new Next.js (stable May 2025) were available.  
  > Why? Familiarity, stronger community support, and broader library compatibility.

- Only the **Main (Latest)** page uses **ISG**.  
  > In hindsight, I could have made **all pages ISG** — since the content isn't frequently updated in real-time, pre-rendering reduces client-side API requests.

- **Testing:**  
  > Spent more time on design than unit tests. Most tests are basic, but Playwright proved valuable.  

- **Design:**  
  > Fully custom-designed, aside from a few AI-generated images.

- **Database:**  
  > Used **mock JSON files** to simulate a database.  
  > In the future, I’d prefer **MongoDB** — since the app doesn’t require a lot of relational data.

---

## 🧠 Things I Wanted to Do (But Ran Out of Time)

1. **Throttled Pagination** – though current performance is decent.
2. **Coverflow Toggle Mode** – like classic Mac OS CD view (vertical).  
   > Didn’t integrate well with Next.js and was too heavy on performance.
3. **More Playwright Tests** – the tooling is impressive.
4. **Upcoming Section** –  
   > TMDB's "Upcoming" API results were unreliable. It often returned now-playing movies or incorrect 2026+ releases.
