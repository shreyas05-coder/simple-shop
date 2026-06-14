# Simple Shop (Frontend + Backend)

This repo contains a minimal storefront:

- Frontend: Vite + React app in `frontend`
- Backend: Node + Express API in `backend`
- Includes product search and category filter, checkout form, and basic email-based order history

For a full deployment walkthrough, see `DEPLOYMENT.md`.

Quick start (from project root):

```
cd backend
npm install
npm start

cd ../frontend
npm install
npm run dev
```

If port `4000` is already in use, restart the backend with a different port and update `VITE_API_URL` accordingly:

```
cd backend
set PORT=4001
node index.js
```

Then run the frontend with `VITE_API_URL=http://localhost:4001` if needed.

The repo now includes `render.yaml`, so you can deploy the backend on Render easily from the root repository.

Deployment suggestions:
- Host frontend on Netlify or Vercel (build output from `frontend/dist`).
- Host backend on Railway, Render, or Fly; set the `VITE_API_URL` for the frontend to the deployed backend URL.

Deployment (quick)

- Frontend (Netlify / Vercel):
	1. Push the project to a Git provider (GitHub/GitLab/Bitbucket).
	2. On Netlify create a new site and connect your repo. Set the build command to `npm run build` and the publish directory to `frontend/dist`.
	3. On Vercel create a new project and point it to the `frontend` folder; Vercel will detect Vite and build automatically. Set `VITE_API_URL` as an Environment Variable in the site settings.

- Backend (Railway / Render):
	1. Push the project to a Git provider.
	2. On Railway create a new project and deploy from your repo. Railway will detect the Node app; ensure the start command is `npm start` and `PORT` is left as default (Railway provides it).
	3. On Render create a new Web Service, point to the `backend` folder, set `npm start` as the start command, and allow the service to deploy.

After deployment:
- Set the frontend env var `VITE_API_URL` to your deployed backend base URL (e.g. `https://your-backend.up.railway.app`).
- Build the frontend (`npm run build`) and configure the host to serve `frontend/dist` (Netlify/Vercel do this automatically).

Full end-to-end publish checklist

1. Initialize git and push

```powershell
cd c:\Users\shrey\Downloads\project
git init
git add .
git commit -m "Initial commit: simple-shop"
gh repo create YOUR_USERNAME/simple-shop --public --source=. --remote=origin
git push -u origin main
```

If you don't have the GitHub CLI (`gh`), create a repo on GitHub and push using the provided remote URL.

2. Deploy backend to Railway (recommended free option)
- Go to https://railway.app and sign in with GitHub.
- Create a new project -> Deploy from GitHub -> select `YOUR_USERNAME/simple-shop`.
- When prompted, set the root to `backend` or the service to use the `backend` folder. Railway will detect Node and run `npm install` + `npm start`.
- After deploy, copy the generated URL and add it as `VITE_API_URL` in your frontend host (Netlify/Vercel) or as Netlify environment variable.

3. Deploy frontend to Netlify
- In Netlify choose "New site from Git" and connect your GitHub repo.
- Set the build command to `npm run build` and the publish directory to `frontend/dist` (netlify.toml already configures this if you deploy root).
- In Site settings -> Environment -> Add `VITE_API_URL` with your Railway backend URL.

4. Validate live site
- Open the Netlify URL and verify products load from the backend and checkout creates orders (backend logs will show orders).

Notes & troubleshooting
- If CORS issues occur, the backend uses `cors()` by default; ensure the deployed backend allows the frontend origin or leave unrestricted for testing.
- To keep secrets out of code, set env vars in the host UI (Netlify/Vercel/Railway). Do not commit `.env`.

