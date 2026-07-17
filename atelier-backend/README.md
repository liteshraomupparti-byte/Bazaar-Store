# Bazaar Backend (Razorpay payments)

This is the small server that makes real Razorpay payments possible. It does two things:
1. Creates a Razorpay "order" before checkout opens.
2. Verifies the payment signature Razorpay sends back, so nobody can fake a "successful" payment.

Your Razorpay **secret key** lives only in this backend — never in the HTML/JS file, so it can't be stolen from the browser.

---

## 1. Get Razorpay API keys

1. Sign up at https://razorpay.com (business KYC needed only for going live — test mode works instantly).
2. Go to **Dashboard → Settings → API Keys**.
3. Generate a **Test key** — you'll get a `Key Id` (starts with `rzp_test_`) and a `Key Secret`.

## 2. Set up this backend

You need [Node.js](https://nodejs.org) installed (v18+).

```bash
cd bazaar-backend
npm install
cp .env.example .env
```

Open `.env` and paste in your real `Key Id` and `Key Secret`:

```
RAZORPAY_KEY_ID=rzp_test_yourrealkeyid
RAZORPAY_KEY_SECRET=yourrealsecret
PORT=5000
```

Run it:

```bash
npm start
```

You should see: `Bazaar backend listening on http://localhost:5000`

## 3. Connect the frontend to it

Open `bazaar-store.html` and near the top of the `<script>` tag, set:

```js
const API_BASE_URL = "http://localhost:5000";
const RAZORPAY_KEY_ID = "rzp_test_yourrealkeyid"; // same Key Id, this one is safe to expose
```

Now open `bazaar-store.html` in Chrome, add something to cart, check out, and pay with
Razorpay's test card: **4111 1111 1111 1111**, any future expiry, any CVV, any OTP.

## 4. Going live for real customers

- Complete Razorpay's KYC/business verification to get **live** keys (`rzp_live_...`).
- Swap the test keys for live keys in `.env` and in `bazaar-store.html`.
- Deploy this backend somewhere it stays running 24/7 — easiest free/cheap options:
  - **Render.com** (Web Service, connect this folder as a GitHub repo, add the same env vars in their dashboard)
  - **Railway.app** (similar — connect repo, add env vars, deploy)
- Deploy `bazaar-store.html` as a static site — **Netlify**, **Vercel**, or **GitHub Pages** all work by just dragging the file in.
- Update `API_BASE_URL` in the HTML to your deployed backend's URL (e.g. `https://bazaar-backend.onrender.com`).
- Restrict `cors()` in `server.js` to only your real site's domain instead of allowing all origins.

## Notes

- This demo still stores products/users/cart in the browser's memory (no database), so that part resets on refresh.
  If you want products and orders to persist for real, the next step is adding a database (e.g. Supabase, MongoDB Atlas)
  and moving the login/product logic into this backend too — happy to help with that next.
- Never commit your real `.env` file (with actual keys) to a public GitHub repo.
