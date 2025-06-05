# 🎬 Movie Web App (Connected to MovieDB API)

An example project of a movie web app built using:

- **Next.js 14** (with **React 18**).
- Integrated with the **MovieDB API**.
- Includes both **client-rendered pages** and an **ISG** (Incremental Static Generation) page.

---

![Screenshot of Movie App](screenshots/screenshot.png)

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

