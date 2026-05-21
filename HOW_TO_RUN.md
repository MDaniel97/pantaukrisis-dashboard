# How to Run PantauKrisis Dashboard

## Prerequisites

- Node.js (for frontend)
- Python 3.13+ (for backend)

---

## Backend (FastAPI — port 8000)

### First-time setup

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

### Start the backend

```bash
cd backend
./venv/bin/uvicorn main:app --reload --port 8000
```

API will be available at: http://localhost:8000  
Interactive docs at: http://localhost:8000/docs

---

## Frontend (Vite/React — port 5173)

### First-time setup

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

App will be available at: http://localhost:5173

---

## Running Both Together

Open two terminal tabs and run each command in its own tab:

**Terminal 1 — Backend:**
```bash
cd backend
./venv/bin/uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```
