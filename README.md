# Team Task Manager

Team Task Manager is a small Jira-style project and task board built with React, Tailwind CSS, Express, MongoDB, Mongoose, and JWT authentication.

## Features

- Signup and login with hashed passwords and JWT auth.
- Admin and Member roles.
- Admins can create projects and tasks.
- Members can see only their projects and update only their assigned tasks.
- Dashboard stats for total, completed, overdue, and assigned tasks.
- Kanban board with Todo, In Progress, and Done columns.
- Responsive Tailwind UI with loading and error states.

## Folder Structure

```txt
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  server.js
frontend/
  src/
    api/
    components/
    context/
    pages/
```

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

The backend also accepts `MONGO_URL` or `DATABASE_URL`, which is useful for Railway-provided MongoDB variables.

3. Start the backend:

```bash
npm run dev
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

5. Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

6. Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

For deployed production, use the Railway and Vercel URLs shown below instead of localhost.

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users` Admin only

### Projects

- `GET /api/projects`
- `POST /api/projects` Admin only
- `PUT /api/projects/:id/members` Admin only
- `DELETE /api/projects/:id` Admin only

### Tasks

- `GET /api/tasks`
- `GET /api/tasks/stats`
- `POST /api/tasks` Admin only
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id` Admin only

## Railway Deployment

1. Push the repo to GitHub.
2. Create a new Railway project.
3. Recommended: deploy from the GitHub repo and select the `backend` folder as the service root.
4. Add environment variables:

```env
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=use-a-long-random-secret-with-at-least-32-characters
CLIENT_URL=https://team-task-manager-theta-liard.vercel.app
```

`JWT_SECRET` is required. Without it, login/signup cannot generate tokens.

The backend also accepts `FRONTEND_URL` as an alias for `CLIENT_URL`.

The app allows `https://*.vercel.app` origins, so signup/login will still work if Vercel gives you a preview or generated production URL.

5. Railway uses `npm start`, which runs `node server.js` when the root directory is `backend`.
   If Railway is accidentally pointed at the repo root, the root `package.json` now forwards `npm start` to `backend`.
6. Your current Railway backend URL is:

```txt
https://team-task-manager-production-0f44.up.railway.app
```

## Vercel Deployment

1. Import the same repo in Vercel.
2. Recommended: set the root directory to `frontend`.
3. Add environment variable:

```env
# No VITE_API_URL is required. The app calls /api and Vercel proxies it to Railway.
```

4. Deploy.
5. Update Railway `CLIENT_URL` with the final Vercel frontend URL:

```env
CLIENT_URL=https://team-task-manager-theta-liard.vercel.app
```

The included `frontend/vercel.json` rewrites app routes to `index.html`, so refreshing `/projects/:id` works in production.

It also proxies frontend API calls:

```txt
Vercel /api/* -> https://team-task-manager-production-0f44.up.railway.app/api/*
```

If you accidentally deploy from the repo root, the root `vercel.json` also points Vercel to build `frontend` and serve `frontend/dist`.

## Demo Script

1. Open the app and create an Admin account.
2. Create a project from the dashboard.
3. Open the project board and create tasks assigned to project members.
4. Show the Kanban columns and update task status.
5. Create a Member account, add that member to a project from the project page, then log in as the member.
6. Show that the member sees only their own projects and can update only their assigned tasks.
7. Return to the dashboard and point out total, completed, overdue, and assigned task metrics.

## Notes

- The first signup can choose Admin for quick local testing.
- In a real production product, Admin assignment should be restricted by an invite or owner-controlled workflow.
