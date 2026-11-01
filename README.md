# Patcharada Tawaditap — Portfolio

A personal portfolio with a public site and a private admin panel for managing its content.

- **Frontend:** React (Vite) + Bootstrap 5, styled with a minimal grayscale design system (Geist / Geist Mono, hairline borders, light and dark themes)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Uploads:** images and PDFs stored in `server/uploads/`

## What you can manage in `/admin`

| Section | What it holds |
| --- | --- |
| Profile & Contact | Name, headline, bio, location, availability, email, phone, LinkedIn, GitHub, profile picture, resume PDF |
| Experience | Roles, dates, highlights, tech, company logo |
| Projects | Title, summary, details, tech, links, cover image, featured flag |
| Education | School, degree, GPA, details, logo |
| Skills | Grouped by category |
| Languages | Spoken languages and proficiency |
| Certifications | Name, issuer, credential link, certificate image |
| Awards | Title, issuer, year |
| Leadership | Roles and descriptions |

Every list can be reordered with the ↑ ↓ buttons.

## Project structure

```
client/          React app (public site + admin)
  src/pages/Portfolio.jsx        public page
  src/pages/admin/               admin pages
  src/pages/admin/config.js      fields for each content type
  src/styles.css                 design tokens and Bootstrap overrides
server/          Express API
  src/index.js                   routes
  src/resources.js               allowed fields per content type
  db/schema.sql                  database tables
  db/seed.js                     starter content from the resume
  uploads/                       uploaded files (not committed)
```

## Run it locally

Requirements: Node.js 18+ and PostgreSQL.

```bash
# 1. Install dependencies
npm run install:all

# 2. Create the database
createdb portfolio

# 3. Configure the server
cp server/.env.example server/.env
#    then set DATABASE_URL, ADMIN_PASSWORD and JWT_SECRET in server/.env

# 4. Create tables and load starter content
npm run db:setup

# 5. Start the API (port 4000) and the React app (port 5173)
npm run dev
```

- Public site: http://localhost:5173
- Admin: http://localhost:5173/admin (sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `server/.env`)

To wipe content and reload the starter data: `npm --prefix server run db:seed -- --force`.

## Production

```bash
npm run build     # builds client/dist
npm start         # Express serves the API and the built site on PORT
```

Host it anywhere that runs Node and PostgreSQL (Render, Railway, Fly.io, a VPS). Set the same variables from `server/.env.example` in the host's settings, and keep `server/uploads/` on persistent storage so uploaded files survive redeploys.

## API

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/portfolio` | public — everything in one call |
| GET / PUT | `/api/profile` | PUT needs admin |
| GET / POST | `/api/:type` | POST needs admin |
| PUT / DELETE | `/api/:type/:id` | admin |
| POST | `/api/upload` | admin — `multipart/form-data` field `file` |
| POST | `/api/auth/login` | public, rate limited |

`:type` is one of `experiences`, `projects`, `education`, `skills`, `languages`, `certifications`, `awards`, `leadership`.
