# Wisp Wallet

**A premium simulated crypto wallet — Phantom-inspired, browser-only, 100% demo data.**

Wisp Wallet is a full crypto-wallet *interface* simulator. It looks and feels
like a real self-custody wallet — live prices, interactive portfolio charts,
send/receive/swap/buy flows, multiple accounts — but every balance is a number
you control, every transaction is fiction, and nothing ever touches a
blockchain. There are no seed phrases, no private keys and no funds.

Built for demos, videos, pitch decks, screenshots, UI practice and fun.

## Highlights

- **Wallet-style UI, not a dashboard** — mobile-first wallet shell with a
  bottom tab bar, bottom sheets, push navigation and a desktop presentation
  that centers the app on an ambient stage.
- **Home** — animated total balance, 24h change, interactive portfolio chart
  with 1H / 1D / 1W / 1M / 1Y / ALL ranges, quick actions and a token list.
- **Total token control** — edit any quantity (250 SOL, 75 ETH, $500,000 USDC
  — anything), pin any custom price, rename tokens and symbols, pick built-in
  icons, emoji or upload your own image, reorder, hide, delete and create
  fully custom tokens. Every total recalculates instantly.
- **Accounts** — create, rename, re-avatar (emoji or image), switch and delete
  accounts. Each account keeps its own holdings.
- **Token detail** — price hero, simulated chart, allocation bar, market
  stats and Send / Receive / Swap actions.
- **Trade** — a complete simulated swap with rate, demo spread and history.
- **Explore** — searchable market list (Top tokens / Movers / Watchlist).
- **Activity** — every simulated send, receive, swap and buy, stored locally.
- **Live prices** — real quotes from the CoinGecko public API with caching,
  a clearly-labelled reference snapshot fallback and honest
  Live / Cached / Unavailable states.
- **Settings** — wallet name, currency (USD/EUR/GBP), quantity decimals,
  hide balances, dark/light appearance, demo watermark, JSON export/import
  and a full reset.
- **PWA** — installable on iPhone and Android (manifest, service worker,
  standalone display, safe-area aware).
- **Simulator guardrails** — DEMO chip, simulation banners on every flow,
  a decorative QR code that sends funds nowhere, and zero key/seed handling.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TypeScript + Vite 7 |
| State | Zustand with localStorage persistence |
| Charts | Hand-rolled SVG (smooth bezier, crosshair, gradient fill) |
| Market data | CoinGecko public API + cached snapshot fallback |
| PWA | vite-plugin-pwa (Workbox) |
| Icons | Original hand-crafted SVG token marks + line icon set |
| Hosting | GitHub Pages via GitHub Actions |

No backend, no database, no analytics — the whole app is static and local.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173/wisp-wallet/
npm run build      # type-checks and builds to dist/
npm run preview    # serves the production build
```

The Vite base path is `/<repo-name>/` so the build works on GitHub Pages
project sites out of the box.

## Deployment

The included workflow (`.github/workflows/deploy.yml`) builds on every push
to `main` and publishes to GitHub Pages using `actions/configure-pages` with
`enablement: true`, so the site activates itself on the first successful run.

Live demo: **https://slerpy19.github.io/wisp-wallet/**

## Data & privacy

- Everything lives in your browser's `localStorage` (key `wisp.store.v1`).
- Export/import your configuration as JSON from Settings at any time.
- The only network request is the public CoinGecko quotes endpoint.
- Nothing is ever uploaded anywhere.

## Honest limitations

- Chart history is **simulated** — seeded walks anchored to current prices,
  labelled as such on every screen. It is not real market history.
- When CoinGecko is unreachable (rate limits, offline), prices fall back to
  the bundled reference snapshot and the UI says so.
- This project is an interface simulator. It is not affiliated with Phantom,
  Solana, or any exchange, and it must not be used to deceive people into
  believing fictional balances are real money.

## Credits

Design language inspired by modern self-custody wallets (Phantom in
particular) with an original identity, palette and codebase. Token marks are
simplified original recreations and remain the property of their projects.
Prices come from the [CoinGecko](https://www.coingecko.com/en/api) public API.

Licensed under MIT — see [LICENSE](LICENSE).
