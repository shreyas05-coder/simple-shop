# Frontend (Vite + React)

Run locally:

```
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` to your backend URL (e.g., `https://my-api.up.railway.app`).

If your local backend uses a different port, set `VITE_API_URL` accordingly, for example:

```
set VITE_API_URL=http://localhost:4001
npm run dev
```

The frontend now also supports product search, category filtering, checkout form fields, and email-based order history lookup.

Deploying the frontend

Netlify:
1. Push your repo to GitHub.
2. In Netlify choose "New site from Git" and connect your repo.
3. Set the build command to `npm run build` and the publish directory to `frontend/dist`.
4. Add an Environment Variable `VITE_API_URL` with your backend URL.

Vercel:
1. Push to GitHub.
2. Create a new Vercel project and point it to the `frontend` folder.
3. Add an Environment Variable `VITE_API_URL`.

If you don't want to use Git: Netlify supports manual drag-and-drop of the `frontend/dist` folder after running `npm run build` locally.
