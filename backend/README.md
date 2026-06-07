# Backend (Express)

Run locally:

```
cd backend
npm install
npm start
```

Deploy to Railway, Render, or Heroku. Ensure `PORT` is respected (code uses `process.env.PORT`).

Railway (quick):
1. Push your repo to GitHub.
2. Create a new project on Railway and connect your GitHub repo.
3. Select the `backend` folder as the service root if prompted. Railway will install dependencies and run `npm start` by default.
4. After deployment note the generated URL and set it as `VITE_API_URL` for the frontend host.

Render (quick):
1. Create a new Web Service and point to your repo.
2. Set the root directory to `backend` and the start command to `npm start`.
