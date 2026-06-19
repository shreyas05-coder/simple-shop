---
name: ivory-thread-project
description: Project handoff and operating guide for the Ivory Thread textile ecommerce app. Use when working on this project, onboarding a new agent/model/chat, debugging deployment, changing frontend/backend behavior, adding admin/product/order/payment features, or reviewing the Netlify + Render + MongoDB production setup.
---

# Ivory Thread Project Skill

Use this file as the first context file for any new agent/chat/model working on the Ivory Thread ecommerce project.

Do not commit real passwords, JWT secrets, UPI IDs, or private dashboard tokens. This file documents where secrets live and what variable names are required. Replace placeholders only in deployment dashboards or local `.env` files.

## Project Summary

Ivory Thread is a luxury textile ecommerce website for buying/selling fabrics and textile products.

The product goal is a simple but premium storefront with:

- Home page with luxury textile brand positioning
- Shop page with product listing and filters
- Product detail modal
- Cart drawer
- Checkout form with shipping/contact details
- QR/UPI payment flow
- Customer auth
- My account/order lookup
- Admin dashboard for products and orders
- Shipping/return/privacy policy pages
- MongoDB persistence
- Netlify frontend deployment
- Render backend deployment

## Live URLs

Frontend:

```txt
https://mitali-project.netlify.app
```

Backend:

```txt
https://simple-shop-npbs.onrender.com
```

Backend health:

```txt
https://simple-shop-npbs.onrender.com/
```

Expected response:

```json
{
  "status": "ok",
  "message": "Ivory Thread API v2 - MongoDB + Admin"
}
```

Mongo health:

```txt
https://simple-shop-npbs.onrender.com/health/db
```

Expected response:

```json
{
  "mongoReadyState": 1,
  "mongoStatus": "connected",
  "database": "ivory-thread"
}
```

## Repository Structure

```txt
project/
  backend/
    index.js
    models/
      User.js
      Product.js
      Order.js
    middleware/
      auth.js
    package.json
    .env.example
  frontend/
    src/
      App.jsx
      AdminDashboard.jsx
      styles.css
      auth.css
      main.jsx
    package.json
    .env.example
  render.yaml
  netlify.toml
  IVORY_THREAD_SKILL.md
```

## Tech Stack

Frontend:

- React 18
- Vite
- Plain CSS
- Deployed on Netlify

Backend:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT auth
- bcrypt password hashing
- Helmet, CORS, Morgan
- Deployed on Render

Database:

- MongoDB Atlas
- Database name: `ivory-thread`
- Collections created by app:
  - `users`
  - `products`
  - `orders`

## Important Environment Variables

Never hardcode real values in source code.

Backend Render environment:

```env
NODE_ENV=production
SECRET=<long-random-jwt-secret>
FRONTEND_URL=https://mitali-project.netlify.app
MONGODB_URI=mongodb+srv://<mongo-user>:<mongo-password>@cluster0.dd7dizy.mongodb.net/ivory-thread?retryWrites=true&w=majority&appName=Cluster0
UPI_ID=<real-upi-id>
UPI_NAME=Ivory Thread
```

Frontend Netlify environment:

```env
VITE_API_URL=https://simple-shop-npbs.onrender.com
```

Local backend `.env`:

```env
SECRET=dev-secret-change-this
FRONTEND_URL=http://localhost:5173
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<mongo-user>:<mongo-password>@cluster0.dd7dizy.mongodb.net/ivory-thread?retryWrites=true&w=majority&appName=Cluster0
UPI_ID=<real-upi-id-or-test-upi>
UPI_NAME=Ivory Thread
```

Local frontend `.env`:

```env
VITE_API_URL=http://localhost:4000
```

Known MongoDB Atlas username from setup:

```txt
shreyaspande2010_db_user
```

Do not store the database password in this file. It is managed in MongoDB Atlas and Render environment variables.

## Deployment Setup

Render backend:

- Service name currently visible in Render: `simple-shop`
- Repo path/root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Production URL: `https://simple-shop-npbs.onrender.com`
- Required environment variables: see Backend Render environment above.

`render.yaml` currently defines:

```yaml
services:
  - type: web
    name: ivory-thread-backend
    env: node
    plan: free
    root: backend
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
```

Netlify frontend:

- Production URL: `https://mitali-project.netlify.app`
- Build command from root: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Required env var: `VITE_API_URL=https://simple-shop-npbs.onrender.com`

MongoDB Atlas:

- Cluster host currently used: `cluster0.dd7dizy.mongodb.net`
- Database: `ivory-thread`
- Network Access must allow Render to connect. Current simple option: `0.0.0.0/0`
- Database user must have read/write access.

## Local Commands

Install frontend:

```powershell
cd c:\Users\shrey\Downloads\project\frontend
npm.cmd install
```

Run frontend:

```powershell
cd c:\Users\shrey\Downloads\project\frontend
$env:VITE_API_URL="http://localhost:4000"
npm.cmd run dev
```

Build frontend:

```powershell
cd c:\Users\shrey\Downloads\project\frontend
npm.cmd run build
```

Install backend:

```powershell
cd c:\Users\shrey\Downloads\project\backend
npm.cmd install
```

Run backend:

```powershell
cd c:\Users\shrey\Downloads\project\backend
npm.cmd start
```

Run backend on alternate port:

```powershell
cd c:\Users\shrey\Downloads\project\backend
$env:PORT="4001"
npm.cmd start
```

Backend syntax check:

```powershell
cd c:\Users\shrey\Downloads\project\backend
node --check index.js
```

Frontend production check:

```powershell
cd c:\Users\shrey\Downloads\project\frontend
npm.cmd run build
```

Git deploy:

```powershell
cd c:\Users\shrey\Downloads\project
git status
git add .
git commit -m "Describe change"
git push origin main
```

After pushing `main`, Render and Netlify should auto-deploy if connected.

## Core Backend Endpoints

Health:

```txt
GET /
GET /health/db
```

Auth:

```txt
POST /auth/register
POST /auth/login
GET /me
```

Products:

```txt
GET /products
GET /products/:id
POST /admin/products
PUT /admin/products/:id
DELETE /admin/products/:id
```

Orders:

```txt
POST /orders
GET /orders
GET /orders/:id
POST /orders/:id/pay
GET /admin/orders
PUT /admin/orders/:id
GET /admin/stats
```

Admin routes require a JWT user with `isAdmin: true`.

## Data Models

User:

```js
{
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  createdAt: Date
}
```

Product:

```js
{
  name: String,
  description: String,
  category: String,
  price: Number, // stored in paise/cents style units
  color: String,
  material: String,
  image: String,
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

Order:

```js
{
  orderId: String,
  userId: ObjectId | null,
  items: [{ id, name, price, qty }],
  total: Number,
  customer: { name, email },
  paymentMethod: "qr" | "card" | "stripe",
  paymentStatus: "pending" | "completed" | "failed",
  stripePaymentIntentId: String,
  shippingAddress: { street, city, state, zip, country },
  createdAt: Date,
  updatedAt: Date
}
```

## Current Features

Customer:

- Browse products
- Filter products by category, color, material, and price
- Search products with debounce
- Open product detail modal
- Add to cart
- Cart drawer instead of permanent sidebar
- Quantity update with stock limits
- Checkout with required field validation
- QR payment generation
- Order lookup by auth token or email
- Login/register

Admin:

- Admin dashboard visible only for users with `isAdmin: true`
- Overview stats
- Product create/edit/delete
- Product stock management
- Order list
- Basic order status update endpoint exists

Backend:

- MongoDB persistence
- JWT auth
- Password hashing
- Admin route protection
- Stock enforcement on order creation
- Backend recalculates total from product records
- QR payment URL generation
- Health checks

## Current UI/UX Direction

Brand: luxury textile business named Ivory Thread.

Look and feel:

- Refined, premium, ivory/gold/dark textile theme
- Large home hero only on Home
- Shop has its own page header
- Product grid is full-width and easy to scan
- Cart opens as a focused drawer
- Checkout errors show inline
- Mobile header uses horizontal scroll chips
- Cart becomes bottom-sheet style on mobile
- Heavy animations reduced on mobile

Important UX expectations:

- Home = brand story and primary CTA
- Shop = product discovery and filtering
- Bag = focused cart/checkout drawer
- About = business story
- Contact = phone/email/WhatsApp details
- Policies = shipping, returns, privacy/terms
- Admin = operational product/order management

## QR Payment Flow

Current MVP QR flow:

1. Customer adds products to cart.
2. Customer fills checkout details.
3. Frontend sends:

```json
{
  "paymentMethod": "qr"
}
```

to:

```txt
POST /orders
```

4. Backend validates stock and customer details.
5. Backend creates a UPI payment URI:

```txt
upi://pay?pa=<UPI_ID>&pn=<UPI_NAME>&am=<amount>&cu=INR&tn=<orderId>
```

6. Backend turns that URI into a QR image URL using:

```txt
https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=<encoded-upi-uri>
```

7. Frontend shows the QR image.

Important limitation:

- The app does not automatically verify whether the UPI payment actually happened.
- The current manual payment confirmation path is not production-safe.
- For real production, replace this with Razorpay/Cashfree/PhonePe/Stripe webhook verification or admin-only payment approval.

Recommended near-term change:

- Customer button should say `I have completed payment`.
- Order should remain `pending` or move to `payment_review`.
- Admin should verify UPI/bank manually and mark as paid.

## Stock Rules

Frontend:

- Product shows stock count.
- Sold-out products cannot be added.
- Cart quantity cannot exceed stock.

Backend:

- Re-fetches products from MongoDB.
- Rejects invalid item IDs.
- Rejects quantities above stock.
- Recalculates total from database product prices.
- Decrements stock after order creation.

Current limitation:

- Stock is reserved/decremented when QR order is created, not when payment is verified.
- This prevents overselling but can reserve stock for unpaid QR orders.

Future improvement:

- Add unpaid order expiry.
- Restore stock if order remains unpaid after a time limit.

## Admin Setup

To make a user admin:

1. Register the user through the live website.
2. Open MongoDB Atlas.
3. Go to database `ivory-thread`.
4. Open collection `users`.
5. Find the user.
6. Change:

```js
isAdmin: false
```

to:

```js
isAdmin: true
```

7. Save.
8. Log out and log in again.

The `Admin` button should appear in the site header.

## Common Debugging Checklist

If products do not load:

1. Check Netlify `VITE_API_URL`.
2. Open backend URL directly.
3. Open `/health/db`.
4. Check Render logs.
5. Check MongoDB Network Access and Database Access.

If registration fails:

1. Open `/health/db`.
2. Expected `mongoReadyState: 1`.
3. Check Render logs for `Registration failed: ...`.
4. Confirm `MONGODB_URI` has real password and database name `/ivory-thread`.

If QR payment button appears not to work:

1. Confirm checkout drawer shows inline field errors.
2. Fill valid email, 10-digit phone, and 6-digit PIN.
3. Check browser network tab for `POST /orders`.
4. Check response body error.
5. Check Render logs for `Failed to create order: ...`.
6. Confirm `UPI_ID` and `UPI_NAME` are set in Render.

If deployed frontend still shows old UI:

1. Wait for Netlify deploy to finish.
2. Trigger `Clear cache and deploy site`.
3. Confirm latest commit is deployed.
4. Hard refresh browser.

If deployed backend still behaves old:

1. Wait for Render deploy to finish.
2. Check Render service logs.
3. Confirm correct branch is deployed.
4. Use `/health/db` and `/` to validate runtime.

## Known Limitations / Next Work

Payment:

- QR payment is not automatically verified.
- Add Razorpay/Cashfree/PhonePe/Stripe for production payment verification.
- Add webhooks.
- Remove customer-side `mark paid` behavior.

Orders:

- Add admin-only `Mark paid`, `Pack`, `Ship`, `Delivered`, `Cancelled`.
- Add unpaid QR order expiry and stock restoration.

Frontend:

- Add real product image upload instead of only image URL.
- Add better account page with saved addresses.
- Add proper order detail page.
- Add loading skeletons.

Security:

- Move from localStorage JWT to httpOnly cookies for production.
- Add rate limiting.
- Add password reset.
- Add stricter CORS domain allowlist.

Admin:

- Add order status controls in UI.
- Add low-stock alerts.
- Add product image upload/storage.

## Best Practices For Future Agents

Before editing:

1. Read `frontend/src/App.jsx`.
2. Read `frontend/src/styles.css`.
3. Read `backend/index.js`.
4. Check `git status --short`.

After editing:

1. Run frontend build:

```powershell
cd frontend
npm.cmd run build
```

2. Run backend syntax check:

```powershell
cd backend
node --check index.js
```

3. Do not commit real secrets.
4. Mention whether Render/Netlify redeploy is required.

Deployment-impacting files:

- `backend/index.js`: Render backend redeploy required
- `backend/package.json`: Render backend redeploy required
- `frontend/src/*`: Netlify frontend redeploy required
- `netlify.toml`: Netlify deploy config
- `render.yaml`: Render deploy config

## Safe Secret Handling

Never write these actual values into source control:

- MongoDB password
- Full MongoDB URI with password
- JWT `SECRET`
- Real UPI ID if the repo may be public
- Render/Netlify dashboard tokens
- Stripe/Razorpay/Cashfree keys

Use placeholders in docs and store real values in:

- Render Environment Variables
- Netlify Environment Variables
- Local uncommitted `.env`
- MongoDB Atlas dashboard

