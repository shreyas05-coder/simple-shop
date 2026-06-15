# Deployment Guide

This guide explains how to deploy the frontend and backend so the app is live on a public URL.

## 1. Push the project to GitHub

If you have not already created a repository:

```powershell
cd C:\Users\shrey\Downloads\project
git init
git add .
git commit -m "Initial commit: simple shop"
```

Then create a repo on GitHub and add the remote. If you have GitHub CLI:

```powershell
gh repo create YOUR_USERNAME/simple-shop --public --source=. --remote=origin
git push -u origin main
```

If you do not have `gh`, create the repo on https://github.com and then run:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/simple-shop.git
git push -u origin main
```

## 2. Deploy the backend to Render (recommended)

Render can deploy this monorepo backend quickly using `render.yaml`.

1. Go to https://render.com and sign in with GitHub.
2. Create a new Web Service.
3. Connect your `YOUR_USERNAME/simple-shop` repo.
4. Render will detect `render.yaml` in the repo and deploy the backend service from the `backend` folder.
5. When deployment completes, copy the generated backend URL.

### If Render asks for service settings manually
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `backend`

### Important
- The backend listens on `process.env.PORT`, so Render will set the correct port automatically.
- `render.yaml` is included in this repo to simplify deployment.

### Backend environment variables
Set these environment variables in your hosting provider for production:

- `VITE_API_URL` (frontend): the deployed backend URL, added in Netlify/Vercel UI
- `SECRET` (backend): a long random secret for signing auth tokens
- `FRONTEND_URL` (backend CORS): the frontend origin allowed to access the API (e.g. `https://your-frontend.netlify.app`)

Install new backend dependencies before deploy: `helmet`, `morgan`, and `dotenv`.
The `backend/package.json` has been updated; `npm install` will fetch them.

### Recommended deployment environment variables
For production, configure these secrets in your hosting dashboard:

- `VITE_API_URL` = `https://your-backend.example.com`
- `SECRET` = `your-long-random-secret`
- `FRONTEND_URL` = `https://your-frontend.example.com`

### Netlify
If you use Netlify, set `VITE_API_URL` in the Netlify UI for the frontend site.

### Render
If you use Render, set `SECRET` and `FRONTEND_URL` in the Render dashboard for the backend service.

### Alternative: Railway
If you still prefer Railway, use the steps below:

1. Go to https://railway.app and sign in with GitHub.
2. Create a new project and choose "Deploy from GitHub".
3. Connect your `YOUR_USERNAME/simple-shop` repo.
4. Select the `backend` folder as the service root if Railway asks.
5. Railway should detect Node and run `npm install` and `npm start` automatically.
6. When deployment completes, copy the generated backend URL.

### Important
- The backend listens on `process.env.PORT`, so Railway will provide the correct port automatically.
- If deploy fails, confirm `backend/package.json` and `backend/index.js` are present.

## 3. Deploy the frontend to Netlify

Netlify can build the frontend from the repo and publish the site.

1. Go to https://app.netlify.com and sign in with GitHub.
2. Create a new site from Git.
3. Connect your `YOUR_USERNAME/simple-shop` repo.
4. Set the build command to:

```bash
npm run build
```

5. Set the publish directory to:

```bash
frontend/dist
```

6. Add an environment variable named `VITE_API_URL` with your deployed backend URL, such as:

```text
https://your-backend.up.railway.app
```

7. Deploy the site.

## 4. Use Vercel instead of Netlify

If you prefer Vercel:

1. Go to https://vercel.com and sign in with GitHub.
2. Add a new project and select the repo.
3. Set the project root to `frontend` if Vercel asks.
4. Add the environment variable `VITE_API_URL` with the backend URL.
5. Deploy.

## 5. Verify the live site

Open the published frontend URL and confirm:
- product cards load correctly
- search and category filter works
- cart adds items
- checkout form submits successfully
- order history search returns past orders by email

## 6. Troubleshooting

### Backend 4000 port conflict locally
If you run locally and port `4000` is in use:

```powershell
cd backend
set PORT=4001
node index.js
```

Then run the frontend with:

```powershell
cd frontend
set VITE_API_URL=http://localhost:4001
npm run dev
```

### Missing environment variable
If the frontend cannot reach the backend after deploy, make sure `VITE_API_URL` is set in Netlify or Vercel.

## 7. Optional: GitHub Actions CI
A CI workflow is included to validate frontend and backend builds on push.
