# Summarist

A clone of [Summarist](https://summarist.vercel.app/) built for the Frontend Simplified Virtual Internship v2.

**Stack:** Next.js (App Router) + TypeScript · Firebase Authentication + Firestore · Stripe via the Firebase "Run Payments with Stripe" extension · Redux Toolkit · react-icons · deployable to Vercel.

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

## 5. Stripe: install the extension and create the plans

The Stripe extension needs the Firebase **Blaze** (pay-as-you-go) plan, because it runs Cloud Functions. Upgrade under **Usage and billing**.

### 5a. Create the two products in Stripe (use Test mode)

In the [Stripe dashboard](https://dashboard.stripe.com/test/products) → **Product catalog → Add product**:

| Product | Price | Billing | Trial |
| --- | --- | --- | --- |
| **Premium Plus** | e.g. $99.99 | Recurring, **Yearly** | 7 days (the app also sends `trial_period_days: 7` when checking out) |
| **Premium** | e.g. $9.99 | Recurring, **Monthly** | none |

After saving each one, open the price and copy its **Price ID** (`price_...`). These go into `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_PLUS_YEARLY` and `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY`.

### 5b. Install "Run Payments with Stripe"

1. Install from <https://extensions.dev/extensions/invertase/firestore-stripe-payments> into your Firebase project.
2. During configuration keep the defaults: products collection `products`, customer collection `customers`, sync new users to Stripe: *Do not sync* (customers are created on first checkout).
3. Enter your **Stripe secret key** (or a restricted key) when asked. It is stored in Google Secret Manager, never in this repo.
4. After install, open the extension's **How this extension works** tab. It gives you a **webhook URL**. In Stripe → **Developers → Webhooks → Add endpoint**, paste it and select these events: `product.created`, `product.updated`, `product.deleted`, `price.created`, `price.updated`, `price.deleted`, `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `tax_rate.created`, `tax_rate.updated`, `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`, `invoice.upcoming`, `invoice.marked_uncollectible`, `invoice.payment_action_required`, `payment_intent.processing`, `payment_intent.succeeded`, `payment_intent.canceled`, `payment_intent.payment_failed`.
5. Copy the webhook's **signing secret** (`whsec_...`) and reconfigure the extension with it.
6. Edit one of the products in Stripe (any small change) so the extension syncs both products into Firestore's `products` collection.

### How checkout works in the app

Clicking the plan button writes a document to `customers/{uid}/checkout_sessions` with the chosen price ID. The extension creates a Stripe Checkout Session and writes back its `url`, and the app redirects there. After payment Stripe returns to `/for-you`. The app listens to `customers/{uid}/subscriptions` (status `active` or `trialing`) to decide the plan: the yearly price ID is **Premium Plus**, the monthly one is **Premium**, no active subscription is **Basic**.

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
| `NEXT_PUBLIC_GUEST_EMAIL` | Guest account email (default `guest@gmail.com`) |
| `NEXT_PUBLIC_GUEST_PASSWORD` | Guest account password (default `guest123`) |

The Stripe **secret key** is never used by this app. It lives only inside the Firebase extension.

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
src/lib/                API client, Firebase init, auth helpers, Stripe, library (Firestore)
src/redux/              store + slices (auth modal, user/subscription, sidebar/font size)
src/types/book.ts       Book type
firestore.rules         Firestore security rules
```
