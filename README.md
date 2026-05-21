# PantauKrisis Dashboard

A real-time Malaysian cost-of-living dashboard that tracks weekly fuel prices and essential commodity prices sourced directly from DOSM (Department of Statistics Malaysia).

## Features

- **Rakyat** — fuel price comparison, personal savings calculator, commodity traffic light, government action ticker
- **Perniagaan (SME)** — trade metrics and supply chain risk score
- **Penganalisis** — macro indicators, trade balance, full commodity table
- Live data from DOSM with 3-tier fallback (backend → DOSM public API → static snapshot → hardcoded constants)
- Backend caches parquet data in-memory with 1-hour TTL, refreshes daily at 08:00

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| State | React Context (no external library) |
| Language | JavaScript (ES modules, JSX) |

### Backend
| | |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn (ASGI) |
| Data processing | Pandas + PyArrow (reads `.parquet` files) |
| HTTP client | httpx (async) |
| Language | Python 3 (local virtualenv) |

### Data Source
DOSM public storage (`storage.data.gov.my`) — `.parquet` files for fuel prices and pricecatcher commodity data.

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend && ./venv/bin/pip install -r requirements.txt
```

### Run

Both servers must run simultaneously:

```bash
# Frontend — http://localhost:5173
npm run dev

# Backend — http://localhost:8000
cd backend && ./venv/bin/uvicorn main:app --reload --port 8000
```

> Vite proxies all `/api/*` requests to the backend, so there are no CORS issues in development.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/fuel/latest` | Latest weekly retail fuel prices + `fetched_at` timestamp |
| `GET /api/fuel/history?weeks=N` | Weekly price history, max 24 weeks |
| `GET /api/commodities` | Median retail commodity prices |
| `GET /api/health` | Cache status |

> **Note:** Fuel history is capped at 24 weeks. DOSM data before ~Oct 2025 has `NaN` in subsidy columns (`ron95_budi95`, `ron95_skps`) as those programmes only started 30 Sep 2025.

## Project Structure

```
pantaukrisis-dashboard/
├── src/
│   ├── pages/
│   │   ├── RakyatPage.jsx
│   │   ├── SMEPage.jsx
│   │   └── AnalystPage.jsx
│   ├── components/        # Reusable UI components
│   ├── data/
│   │   └── constants.js   # Fallback data + DOSM response mappers
│   ├── api.js             # Data fetching with 3-tier fallback
│   └── PantauKrisisDashboard.jsx  # Root component + DataContext
├── backend/
│   ├── main.py            # FastAPI app
│   └── requirements.txt
├── public/
│   └── fuel-snapshot.json # Written by backend at startup as static fallback
└── vite.config.js         # Includes /api proxy config
```

## Data Flow

```
Browser → Vite (5173) —/api/*→ FastAPI (8000) → DOSM parquet files
```

On startup the backend writes `public/fuel-snapshot.json` so the frontend has a static fallback even if the backend is unreachable on subsequent loads.
