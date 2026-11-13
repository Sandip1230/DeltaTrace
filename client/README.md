# DeltaTrace

**Autonomous Water Quality Assessment & Effluent Source Identification**
A MERN-stack dashboard that monitors river and canal stations, computes a Water Quality Index (WQI), raises threshold alerts, and traces pollution spikes back to likely effluent sources.

> CAA Project, JIS Group, 3rd Sem CSE 2026-27 (Project ID: RI_003)
> Uses hardcoded and simulated sensor data (no physical sensors needed).


## Design System (60-30-10)

| Share | Colour                    | Used for                                                                            |
| ----- | ------------------------- | ----------------------------------------------------------------------------------- |
| 60%   | Electric blue `#0145F2` | Backgrounds and glass surfaces                                                      |
| 30%   | Soft lavender `#DBC9FA` | Header, nav, scope bar, tints, borders, secondary text, data lines                  |
| 10%   | Acid green `#7FFF00`    | Buttons, active and selected states, live indicator, hover glow, "Excellent" status |

WQI status colours (Excellent, Good, Poor, Very Poor, Unfit) stay distinct for readability.



## Features

| Module         | What it does                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------- |
| Secure login   | Email + password, then 4-digit OTP, then JWT session (animated OTP UI)                       |
| Dashboard      | Average WQI gauge, stat cards, 7-day parameter trends, WQI by station, live pollution events |
| Stations       | Dark map of stations and suspected sources, station detail, searchable table                 |
| Alerts         | Threshold-based warnings and critical alerts with acknowledge and resolve workflow           |
| Source Tracker | Matches a pollutant signature to likely effluent sources (cosine similarity plus distance)   |
| Live stream    | Simulated sensor readings pushed to the browser every 15s via Server-Sent Events             |
| UI             | Glassmorphism theme, floating notch navigation with a hopping ball, glow-border inputs       |

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Framer Motion, Recharts, React-Leaflet, Lucide
- **Backend:** Node.js, Express, JWT, bcryptjs
- **Database:** MongoDB with Mongoose
- **Realtime:** Server-Sent Events (EventSource)

## Project Structure

```
deltatrace/
├── client/          # React app (pages, components, context, hooks, styles)
├── server/          # Express API (models, controllers, routes, services, data)
├── docs/            # Report, diagrams, screenshots
└── package.json     # Root scripts (run client and server together)
```

## Getting Started

**Prerequisites:** Node.js 18+, MongoDB running locally (or an Atlas URI)

```bash
# 1. Install everything
npm run install-all

# 2. Configure the server
cp server/.env.example server/.env   # then fill in the values below

# 3. Seed the database (stations, sources, readings, alerts, demo users)
npm run seed --prefix server

# 4. Run client and server together
npm run dev
```

Client: http://localhost:5173 | API: http://localhost:5000

### Environment variables (`server/.env`)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/deltatrace
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES=7d
ENABLE_STREAM=true
STREAM_INTERVAL_MS=15000
```

### Demo accounts (created by the seed script)

| Role   | Email                 | Password   |
| ------ | --------------------- | ---------- |
| Admin  | admin@deltatrace.com  | Admin@123  |
| Viewer | viewer@deltatrace.com | Viewer@123 |

In development the OTP is shown on the login screen ("Dev OTP") and printed in the server console. In production (`NODE_ENV=production`) it is not returned.

## How It Works

**WQI (weighted arithmetic index).** For each parameter, quality rating `q = |V - ideal| / |standard - ideal| x 100`, weight `w = 1 / standard`, and `WQI = sum(q x w) / sum(w)`. Lower is cleaner. Status bands: Excellent (<=25), Good (<=50), Poor (<=75), Very Poor (<=100), Unfit (>100).

**Alerts.** Each parameter has warning and critical limits. The engine keeps one open alert per station and parameter, updates it while the breach continues, and auto-resolves it when the value returns to normal.

**Source identification.** The latest reading is converted to a deviation vector from clean-water baselines. Each known source has a signature vector. Score = 75% cosine similarity + 25% proximity (haversine distance). Results show confidence, distance, and matched parameters.

## API Overview

All routes except `/api/auth/*` and `/api/health` need `Authorization: Bearer <token>`.

| Method | Route                                                                           | Purpose                               |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------- |
| POST   | `/api/auth/register`                                                          | Create account                        |
| POST   | `/api/auth/login`                                                             | Check password, send OTP              |
| POST   | `/api/auth/resend-otp`                                                        | Resend OTP (40s cooldown)             |
| POST   | `/api/auth/verify-otp`                                                        | Verify OTP, returns JWT               |
| GET    | `/api/stations`, `/api/stations/:id`, `/api/stations/:id/readings?days=7` | Stations and history                  |
| GET    | `/api/readings/latest`, `/api/readings/summary`                             | Latest per station, dashboard summary |
| GET    | `/api/sources`                                                                | Known effluent sources                |
| GET    | `/api/alerts`, `/api/alerts/stats`                                          | List and counts                       |
| PATCH  | `/api/alerts/:id/acknowledge`, `/api/alerts/:id/resolve`                    | Alert workflow                        |
| POST   | `/api/alerts/sync`                                                            | Re-evaluate alerts (admin)            |
| GET    | `/api/tracker`, `/api/tracker/:stationId`                                   | Source identification                 |
| POST   | `/api/tracker/simulate`                                                       | What-if analysis with custom values   |
| GET    | `/api/stream?token=`                                                          | Live readings (SSE)                   |

## Progress

- [X] Monorepo, Express API, MongoDB models, hardcoded dataset, WQI service
- [X] JWT auth with OTP, route protection
- [X] Alert engine, source identification algorithm
- [X] Live sensor simulation (SSE)
- [X] Glass UI, OTP login, floating notch nav, dashboard
- [X] Stations page (map), Alerts page
- [ ] Source Tracker page
- [ ] Reports page (history and CSV export)
- [ ] Final polish, screenshots, report

## Team

Sandip Maitra, Sandeep Yadav, Sangeeta Biswas, Sanghita Roy, Sarthak Patra
