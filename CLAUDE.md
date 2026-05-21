# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

Two servers must run simultaneously:

**Frontend** (Vite + React, port 5173):
```bash
npm run dev
```

**Backend** (FastAPI, port 8000):
```bash
cd backend && ./venv/bin/uvicorn main:app --reload --port 8000
```

The frontend proxies all `/api/*` requests to the backend via Vite's `server.proxy` config in `vite.config.js`. There is no CORS issue in dev because of this proxy — CORS is only relevant in production.

**Install dependencies:**
```bash
npm install                                        # frontend
cd backend && ./venv/bin/pip install -r requirements.txt  # backend
```

> Use `./venv/bin/pip` and `./venv/bin/uvicorn` — Homebrew Python 3.13 blocks system pip.

## Architecture

### Dual-server setup
- `backend/main.py` — FastAPI serving DOSM data as JSON. Fetches `.parquet` files from `storage.data.gov.my`, caches them in-memory (1-hour TTL), and refreshes daily at **08:00 local time**. On startup it writes `public/fuel-snapshot.json` for frontend fallback.
- `src/` — React 18 SPA, Tailwind CSS v3, Recharts for charts.

### Frontend data flow (3-tier fallback)
When the app loads, fuel data is fetched in this priority order:
1. `/api/fuel/latest` — backend (freshest, includes `fetched_at` timestamp)
2. `https://api.data.gov.my/data-catalogue?id=fuelprice&limit=1&sort=-date` — DOSM public API direct
3. `/fuel-snapshot.json` — last snapshot written by the backend at 08:00
4. Hardcoded `FUEL` in `src/data/constants.js` — absolute last resort (only if all three fail)

### State & context
`PantauKrisisDashboard.jsx` owns all top-level state (`fuel`, `commodities`, `lastUpdated`) and provides it via `DataContext`. Child components consume it with `useContext(DataContext)`. No external state library is used.

### Persona-based layout
The dashboard has three views switched by a sticky tab bar:
- **Rakyat** (`RakyatPage`) — fuel comparison, savings calculator, commodity traffic light, government actions
- **Perniagaan** (`SMEPage`) — trade metrics, supply chain risk score
- **Penganalisis** (`AnalystPage`) — macro grid, trade balance, full commodity table

### Mock / fallback data (`src/data/constants.js`)
All static fallback values live here: `FUEL`, `COMMODITIES`, `ANALYST`, `SME`, `GOVT_ACTIONS`, `VEHICLES`, `CALC_CATEGORIES`. The helper functions `mapFuelResponse()` and `mapCommoditiesResponse()` translate DOSM API responses into the shape the app expects, merging with fallback values for any missing fields.

### Backend API endpoints
| Endpoint | Description |
|---|---|
| `GET /api/fuel/latest` | Latest weekly retail prices + `fetched_at` timestamp |
| `GET /api/fuel/history?weeks=N` | Weekly price history, max 24 weeks (older rows have NaN in subsidy columns) |
| `GET /api/commodities` | Median retail prices from pricecatcher parquet |
| `GET /api/health` | Cache status |

### Key constraints
- **Fuel history capped at 24 weeks** — DOSM data before ~Oct 2025 has NaN in `ron95_budi95` and `ron95_skps` columns (those subsidy programmes started 30 Sep 2025).
- `lastUpdated` state is set from `fetched_at` (automation time) → `snapshot_at` → `fuelData.date` in priority order, always stored as an ISO string for `new Date()` parsing.
