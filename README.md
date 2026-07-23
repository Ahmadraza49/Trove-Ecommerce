# AI-Powered E-commerce System

Final Year Project — Islamia University of Bahawalpur, Department of Computer Science
Author: Ahmad Raza (S23BDOCS1M01133) | Supervisor: Umar Ajmal

This is a MERN-stack (MongoDB, Express, React, Node.js) implementation built directly
from the project's **SRS (Software Requirements Specification)** and **SDD (Software
Design Description)** documents. Every module below maps to a specific section of
those documents so you can cite it in your project report / defense.

## What's implemented (skeleton, ready to extend)

| SRS/SDD Module | Backend | Frontend |
|---|---|---|
| 3.2.1 User Authentication (UC-01, UC-02) | `authController.js`, JWT + bcrypt | Login.jsx, Register.jsx |
| 3.2.2 Product Management (UC-08) | `productController.js` | SellerDashboard.jsx |
| 3.2.6 Search & Filtering (UC-03, UC-09) | `getProducts` (keyword/category/price/sort) | Home.jsx |
| 3.2.5 Cart Management (UC-04, UC-11) | `cartController.js` | Cart.jsx |
| 3.2.3 Order Management (UC-05) + 3.3.7 Order Tracking (UC-07) | `orderController.js`, tracking ID generator | Checkout.jsx, Orders.jsx, OrderDetails.jsx |
| 3.2.4 Review & Rating (UC-13) | `reviewController.js`, auto rating average | ProductDetails.jsx |
| 3.3.12 Wishlist Management | `wishlistController.js` | Wishlist.jsx |
| 3.2.7 AI Recommendation | `aiController.js` (rule-based content filtering + popularity fallback) | Home.jsx |
| 3.2.8 / 3.3.14 AI Chatbot | `chatbotController.js` (rule-based intent matcher) | ChatbotWidget.jsx |
| 3.2.10 / 3.3.15 Notifications | `notificationController.js` + Socket.IO real-time push | OrderDetails.jsx (live status) |
| Admin Dashboard (user mgmt, analytics) | `adminController.js` | AdminDashboard.jsx |
| Seller Store (SRS 2.2) | Auto-created `store` field on User at registration | SellerDashboard.jsx |

### About the AI parts

- **Recommendations** (`aiController.js`): if `GEMINI_API_KEY` is set, Gemini
  ranks a candidate pool of products against the user's `browsingHistory`
  (populated automatically whenever they view a product), returning
  structured JSON that's validated against the real candidate IDs so it can
  never "invent" a product. If Gemini is unavailable/unconfigured/fails, it
  falls back to content-based filtering (same-category products sorted by
  rating), and finally to globally popular products if there's no history at all.
- **Chatbot** (`chatbotController.js`): if `GEMINI_API_KEY` is set, live
  context (the user's latest order, any tracking ID mentioned, matching
  products) is gathered from the database and passed to Gemini so it answers
  with real facts instead of inventing them. If Gemini is unavailable, it
  falls back to a small rule-based intent matcher (`INTENTS` array) that
  handles greetings, order tracking, product search, returns, and support
  handoff, with a final fallback message for anything unrecognized.

**Getting a Gemini API key (free tier):**
1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Click "Create API key" and copy it.
3. Paste it into `backend/.env` as `GEMINI_API_KEY=your_key_here`.
4. Restart the backend (`npm run dev`). No key = the app still works fully,
   just using the rule-based fallback logic instead of live AI calls.

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed              # optional: creates demo admin/seller/buyer + 3 products
npm run dev                # starts on http://localhost:5000
```

Demo accounts created by `npm run seed`:
- admin@example.com / admin123
- seller@example.com / seller123
- buyer@example.com / buyer123

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so just open
http://localhost:5173 once both servers are running.

### 3. Requirements

- Node.js 18+
- A running MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster —
  just paste its connection string into `MONGO_URI`)

## Suggested next steps for your FYP

1. **Diagrams**: generate the Use Case, ER, DFD, Activity, and Context/Container
   diagrams referenced in the SDD (Figures 3.1, 3.2, 5.1, 8.1–8.4) — draw.io or
   Lucidchart work well, and the module/entity names here match the SRS/SDD text
   exactly so the diagrams will stay consistent with the code.
2. **Payment gateway**: `orderController.js` currently simulates a successful
   payment (`paymentSuccessful = true`). Swap in Stripe/JazzCash/EasyPaisa once
   you pick one for your defense.
3. **Image uploads**: products currently take image URLs as strings; wire up
   `multer` + local disk or Cloudinary if you want real image uploads.
4. **Testing**: add Jest/Supertest tests per controller before your final
   submission — examiners often ask about test coverage.
5. **Deployment**: backend → Render/Railway, frontend → Vercel/Netlify,
   database → MongoDB Atlas free tier.

## Folder structure

```
ecommerce-project/
├── backend/
│   ├── config/db.js
│   ├── models/          # User, Product, Cart, Order, Review, Notification
│   ├── controllers/      # one per SRS module
│   ├── routes/
│   ├── middleware/       # JWT auth, role-based authorize(), error handler
│   ├── utils/            # token/tracking-ID generators, seed script
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/   # Navbar, ProductCard, ChatbotWidget, ProtectedRoute
        └── pages/         # one per screen listed in SDD 6.2
```
