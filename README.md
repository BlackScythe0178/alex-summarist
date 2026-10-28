# Summarist

A clone of [Summarist](https://summarist.vercel.app/) built for the Frontend Simplified Virtual Internship v2.

**Stack:** Next.js (App Router) + TypeScript · Firebase Authentication + Firestore · Stripe Checkout via Next.js API routes · Redux Toolkit · react-icons · deployable to Vercel.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Home page (ported from the Frontend Simplified starter), animated statistics headings, Login buttons open the auth modal |
| `/for-you` | Selected, Recommended and Suggested books with Premium pills and audio durations |
| `/book/[id]` | Full book details, Read/Listen gating, Add to My Library |
| `/player/[id]` | Summary text + custom audio player (play/pause, ±10s, draggable progress, times) |
| `/choose-plan` | Sales page: yearly/monthly plan switch, FAQ accordion, Stripe checkout |
| `/settings` | Email and subscription status (Basic / Premium / Premium Plus) |
| `/library` | Saved books and finished books (audio played to the end) |

The sidebar and search bar appear on every page except `/` and `/choose-plan`.

---

## 1. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see step 6)
npm run dev                  # http://localhost:3000
npm run build                # production build check
```

Requires Node.js 20.9 or newer.

## 2. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** (this repo is set up for the `alex-summarist` project).
2. **Project settings → General → Your apps → Web (`</>`)** → register a web app. Copy the config values into `.env.local` (step 6).
3. **Build → Firestore Database → Create database** (production mode, any region).
4. Open the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules) and **Publish**. These rules let each user read and write only their own library and Stripe documents.

## 3. Enable Email/Password and Google sign-in

1. **Build → Authentication → Get started → Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google**, pick a support email, save.
4. **Authentication → Settings → Authorized domains**: add your Vercel domain (e.g. `alex-summarist.vercel.app`) once deployed. `localhost` is there by default.

> Firebase's *email enumeration protection* (on by default for new projects) makes a wrong email and a wrong password return the same error. The modal then shows "User not found or incorrect password". To get a separate "User not found" message, turn the protection off under **Authentication → Settings → User actions**.

## 4. Create the guest user

**Authentication → Users → Add user**:

- Email: `guest@gmail.com`
- Password: `guest123`

The "Login as a Guest" button signs in with `NEXT_PUBLIC_GUEST_EMAIL` / `NEXT_PUBLIC_GUEST_PASSWORD`, which default to these values.

## 5. Stripe: create the plans

Checkout runs through this app's own API routes on Vercel, which call Stripe directly. There is **no Firebase extension**, so the Firebase project stays on the free **Spark** plan and nothing here costs money (Vercel Hobby and Stripe test mode are free).

### 5a. Create the two products in Stripe (use Test mode)

In the [Stripe dashboard](https://dashboard.stripe.com/test/products), with **Test mode** on, go to **Product catalog → Add product**:

| Product | Price | Billing | Trial |
| --- | --- | --- | --- |
| **Premium Plus** | e.g. $99.99 | Recurring, **Yearly** | 7 days (added by the app at checkout) |
| **Premium** | e.g. $9.99 | Recurring, **Monthly** | none |

Open each price and copy its **Price ID** (`price_...`) into `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_PLUS_YEARLY` and `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY`.

### 5b. Add the Stripe secret key

**Developers → API keys → Secret key → Reveal test key**, then copy the `sk_test_...` key into `STRIPE_SECRET_KEY`. It has no `NEXT_PUBLIC_` prefix, so it stays on the server and never reaches the browser. Never commit it or share it.

### How checkout works in the app

- `POST /api/checkout` verifies the user's Firebase ID token, finds or creates their Stripe customer (matched by email, tagged with the Firebase UID), and creates a Stripe Checkout Session. Yearly gets `trial_period_days: 7`. The browser is redirected to Stripe, then back to `/for-you`.
- `GET /api/subscription` verifies the user and reads their Stripe subscriptions. `active` or `trialing` on the yearly price is **Premium Plus**, on the monthly price **Premium**, otherwise **Basic**. The app asks again whenever the tab regains focus.

No webhook is needed, because the plan is read from Stripe each time.

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## 6. Environment variables

All are listed in [`.env.example`](./.env.example). Copy it to `.env.local` (git-ignored, never commit it).

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase → Project settings → Your apps → config `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |
| `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_PLUS_YEARLY` | Stripe price ID of the yearly Premium Plus price |
| `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY` | Stripe price ID of the monthly Premium price |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`), server only |
| `NEXT_PUBLIC_GUEST_EMAIL` | Guest account email (default `guest@gmail.com`) |
| `NEXT_PUBLIC_GUEST_PASSWORD` | Guest account password (default `guest123`) |

`STRIPE_SECRET_KEY` is read only by the API routes on the server. Add it in Vercel, never in client code.

## 7. Deploy to Vercel

1. Push the repo to GitHub (already done: `BlackScythe0178/alex-summarist`).
2. In [Vercel](https://vercel.com/new) → **Add New → Project** → import the repo. The framework preset is detected as Next.js; keep the default build settings.
3. Under **Environment Variables**, add every variable from step 6 (for Production, Preview and Development).
4. **Deploy**.
5. Add the deployed domain to Firebase **Authentication → Settings → Authorized domains** so Google sign-in works there.

Book data comes from the public Summarist API (`us-central1-summaristt.cloudfunctions.net`). Covers and audio load from `firebasestorage.googleapis.com`, which is allowed for `next/image` in `next.config.ts`.

## Project structure

```
public/                 logo.png, landing.png, google.png, login.png, pricing-top.png
src/app/                routes (the (app) group holds pages with sidebar + search bar)
src/components/         home page sections, auth modal, sidebar, search, player, skeletons
src/hooks/              audio duration, Read/Listen gating, home login
src/app/api/            checkout + subscription routes (Stripe, server side)
src/lib/                API client, Firebase init, auth helpers, Stripe, library (Firestore)
src/redux/              store + slices (auth modal, user/subscription, sidebar/font size)
src/types/book.ts       Book type
firestore.rules         Firestore security rules
```
