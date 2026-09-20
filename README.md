# Stretch

A phone-friendly daily stretch session for **Susie Scher**.

**On your phone (no install):** [https://susiescher-hue.github.io/Stretch/](https://susiescher-hue.github.io/Stretch/)

Same routine every day. About ten minutes. The timer lives in the app — no extra clock. Pause, resume, skip, or end early. When you finish, the day is stamped on this phone.

No login. Progress stays in `localStorage` on this device.

If the link 404s the first time, enable Pages once: repo **Settings → Pages → Source: GitHub Actions**.

## The routine

1. **Cat-Cow** — 60s — wake the spine
2. **Open-Book Thoracic Rotation** — 40s each side
3. **Chin Tucks + gentle neck side bend** — 45s
4. **World’s Greatest Stretch** — 45s each side
5. **Half-Kneeling Hip Flexor** — 60s each side (optional deeper couch stretch)
6. **Figure-4 Glute / Hip** — 45s each side
7. **Supine Hamstring with strap/towel/belt** — 45s each side
8. **Child’s Pose breathing** — 45s — finish

Each move has a short form cue and a **Watch demo** button that opens YouTube in a new tab. Bilateral moves pause with a **Switch sides** prompt.

World’s Greatest Stretch uses the UCLA Recreation demo (`tCwUnHRi7jY`) — one trainer, about 49 seconds, little talking. Child’s Pose uses Susie’s pick (`Ndhfm1Jxu2U`).

## Safety

For everyday stiffness and mobility — not medical treatment. Move in a comfortable range. Stop if you feel sharp or radiating pain.

## Run it

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/Stretch/` (the app is built for GitHub Pages at `/Stretch/`).

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite + React + TypeScript app |
| `npm test` | Run routine and streak checks |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build |

Add the page to your home screen if you like. It is set up as a simple standalone web app named **Stretch**.
