# Mini Shop — Mobile App

Expo React Native storefront for the **Mini Shop** challenge: auth, product catalogue, cart, checkout, and order history. Talks to the Fastify API on port **5001**.

| Setting | Value                                     |
| ------- | ----------------------------------------- |
| Stack   | Expo SDK 54 · React Native · TypeScript   |
| Router  | Expo Router (file-based)                  |
| State   | React Query · Context (auth, cart, theme) |
| API     | REST + JWT (SecureStore)                  |

---

## Prerequisites

- [Node.js](https://nodejs.org) 18+ (or Bun)
- [Expo Go](https://expo.dev/go) on your phone **or** Android emulator / iOS simulator
- Backend running at **http://localhost:5001** (see [backend/README.md](../backend/README.md))
- Same Wi‑Fi as your dev machine when using a physical device

---

## Quick start

```bash
cd mobile
npm install
npm start
```

Press `a` (Android) / `i` (iOS) / scan QR for Expo Go.

### Test customer (after backend seed)

| Field    | Value                    |
| -------- | ------------------------ |
| Email    | `customer@minishop.test` |
| Password | `Customer123!`           |

Or register a new account from the app.

---

## Environment

```bash
cp .env.example .env
```

| Variable                   | Required | Description                                   |
| -------------------------- | -------- | --------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | No       | Full API URL, e.g. `http://192.168.1.71:5001` |

**If you already have `mobile/.env`:** keep it. You only need `EXPO_PUBLIC_API_BASE_URL` when:

- Expo cannot infer your machine IP (check Metro logs for `[Mini Shop] API base URL: …`)
- You use a physical phone and requests fail with a network error
- You are not on the same network segment as the dev server

**Auto-detection (default):** In development, the app builds the API URL from the Expo dev server host + port `5001` (see `lib/env.ts`). Android emulator uses `10.0.2.2` when appropriate.

**After changing `.env`:** stop Metro and run `npm start` again (or `npx expo start -c` to clear cache).

---

## Features

| Area        | Details                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| **Auth**    | Sign in, register, forgot password; JWT + refresh in SecureStore                   |
| **Shop**    | Masonry product grid, search, category chips, infinite scroll, pull-to-refresh     |
| **Cart**    | Quantity controls, persisted locally (AsyncStorage), checkout → order confirmation |
| **Orders**  | History with status filters, detail screen with status timeline                    |
| **Profile** | Edit name, theme toggle (light/dark), sign out                                     |
| **UX**      | Skeletons, empty states, Reanimated transitions, toasts                            |

### Tabs

Shop · Cart · Orders · Profile

---

## Scripts

```bash
npm start          # Expo dev server
npm run android    # Open on Android
npm run ios        # Open on iOS
npm run web        # Expo web (API must allow CORS for web origin)
```

---

## Project structure

```text
mobile/
├── app/                 # Expo Router screens
│   ├── (auth)/          # sign-in, register, forgot-password
│   ├── (tabs)/          # shop, cart, orders, profile
│   ├── product/[id].tsx
│   └── order/[id].tsx
├── features/            # api, auth, cart, hooks
├── lib/                 # api client, env, format
├── theme/               # colors, ThemeContext
└── ui/                  # shared components
```

---

## Troubleshooting

| Issue                            | Fix                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Network error / cannot reach API | Set `EXPO_PUBLIC_API_BASE_URL` to `http://<PC-LAN-IP>:5001`; ensure backend is running |
| CORS (Expo web only)             | Add web origin to `backend/.env` → `CORS_ORIGIN`                                       |
| 401 after long idle              | Sign in again; app refreshes token on launch when possible                             |
| No products                      | Run `bun --cwd backend run seed` and confirm API health                                |

---

## Related docs

- [Root README](../README.md) — monorepo overview and env matrix
- [Backend README](../backend/README.md) — API and seed data
- [Dashboard README](../dashboard/README.md) — admin app
