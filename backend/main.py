"""
PantauKrisis — FastAPI backend
Fetches parquet data from DOSM (data.gov.my) and serves it as JSON.

Run:
    uvicorn main:app --reload --port 8000
"""

import asyncio
import io
import json
import logging
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode

import httpx
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PantauKrisis API", version="1.0.0")

DOSM_BASE      = "https://storage.data.gov.my"
FUEL_URL       = f"{DOSM_BASE}/commodities/fuelprice.parquet"
SNAPSHOT_PATH  = Path(__file__).parent.parent / "public" / "fuel-snapshot.json"

BNM_EXCHANGE_URL  = "https://api.bnm.gov.my/public/exchange-rate"
DOSM_CATALOGUE    = "https://api.data.gov.my/data-catalogue/"
FRED_DEXMAUS_URL  = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXMAUS"
EIA_SPT_BASE      = "https://api.eia.gov/v2/petroleum/pri/spt/data/"
EIA_KEY           = "DEMO_KEY"  # register at eia.gov/opendata for a personal key

import os

_EXTRA_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        # GitHub Pages
        "https://mdaniel97.github.io",
        # Add custom domain here if you set one up later
        *_EXTRA_ORIGINS,
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ── In-memory caches ─────────────────────────────────────────────────────────
_cache: dict[str, tuple[pd.DataFrame, datetime]] = {}
_json_cache: dict[str, tuple[any, datetime]] = {}
CACHE_TTL = timedelta(hours=1)


def _cached(url: str) -> Optional[pd.DataFrame]:
    if url in _cache:
        df, fetched_at = _cache[url]
        if datetime.now() - fetched_at < CACHE_TTL:
            return df
    return None


async def fetch_parquet(url: str) -> pd.DataFrame:
    if (hit := _cached(url)) is not None:
        logger.info("cache hit: %s", url)
        return hit

    logger.info("fetching: %s", url)
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    df = pd.read_parquet(io.BytesIO(resp.content))
    _cache[url] = (df, datetime.now())
    return df


async def fetch_json(url: str, **kwargs) -> any:
    if url in _json_cache:
        data, ts = _json_cache[url]
        if datetime.now() - ts < CACHE_TTL:
            return data
    logger.info("fetching json: %s", url)
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(url, **kwargs)
        resp.raise_for_status()
    data = resp.json()
    _json_cache[url] = (data, datetime.now())
    return data


async def fetch_fred_myr_usd() -> list[tuple[str, float]]:
    """Fetch FRED DEXMAUS CSV and return the last 30 valid daily MYR/USD observations."""
    cache_key = "fred_dexmaus"
    if cache_key in _json_cache:
        data, ts = _json_cache[cache_key]
        if datetime.now() - ts < CACHE_TTL:
            return data
    logger.info("fetching FRED DEXMAUS")
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(FRED_DEXMAUS_URL)
        resp.raise_for_status()
    valid: list[tuple[str, float]] = []
    for line in resp.text.strip().split("\n")[1:]:
        parts = line.strip().split(",")
        if len(parts) == 2 and parts[1] not in (".", "", " "):
            try:
                valid.append((parts[0], float(parts[1])))
            except ValueError:
                pass
    recent = valid[-30:]
    _json_cache[cache_key] = (recent, datetime.now())
    return recent


async def fetch_eia_oil(length: int = 600) -> list[dict]:
    """Fetch Brent (RBRTE) and WTI (RWTC) daily spot prices from EIA open data."""
    params = [
        ("api_key",           EIA_KEY),
        ("frequency",         "daily"),
        ("data[0]",           "value"),
        ("facets[series][]",  "RBRTE"),
        ("facets[series][]",  "RWTC"),
        ("sort[0][column]",   "period"),
        ("sort[0][direction]","desc"),
        ("length",            str(length)),
    ]
    url = f"{EIA_SPT_BASE}?{urlencode(params)}"
    data = await fetch_json(url)
    return data["response"]["data"]


def _add_months(date_str: str, months: int) -> str:
    d = datetime.strptime(date_str, "%Y-%m-%d")
    total = d.year * 12 + (d.month - 1) + months
    return f"{total // 12}-{total % 12 + 1:02d}-01"


def _trend(val: Optional[float]) -> str:
    if val is None:
        return "flat"
    return "up" if val > 0 else "down" if val < 0 else "flat"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_dates(df: pd.DataFrame) -> pd.DataFrame:
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
    return df


def _pct(new: float, old: float) -> Optional[float]:
    if old and not pd.isna(old) and not pd.isna(new):
        return round((new - old) / old * 100, 1)
    return None


async def _latest_pricecatcher() -> pd.DataFrame:
    """Try current month then fall back up to 2 months."""
    today = date.today().replace(day=1)
    for delta in range(3):
        d = today
        for _ in range(delta):
            d = (d - timedelta(days=1)).replace(day=1)
        url = f"{DOSM_BASE}/commodities/pricecatcher_{d.strftime('%Y-%m')}.parquet"
        try:
            return await fetch_parquet(url)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                continue
            raise
    raise HTTPException(502, "pricecatcher data unavailable")


# ── Startup & daily refresh ───────────────────────────────────────────────────

URLS_TO_PREFETCH = [FUEL_URL]


async def _write_snapshot():
    """Write the latest fuel prices to public/fuel-snapshot.json for frontend fallback."""
    try:
        df = _fuel_levels(_parse_dates(await fetch_parquet(FUEL_URL)))
        row = df.iloc[-1]

        def f(val):
            return float(val) if not pd.isna(val) else None

        snapshot = {
            "date":             row["date"].strftime("%Y-%m-%d"),
            "ron95":            f(row["ron95"]),
            "ron97":            f(row["ron97"]),
            "diesel":           f(row["diesel"]),
            "diesel_eastmsia":  f(row["diesel_eastmsia"]),
            "ron95_skps":       f(row["ron95_skps"]),
            "ron95_budi95":     f(row["ron95_budi95"]),
            "snapshot_at":      datetime.now().isoformat(),
        }

        SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
        SNAPSHOT_PATH.write_text(json.dumps(snapshot, indent=2))
        logger.info("snapshot written → %s", SNAPSHOT_PATH)
    except Exception as exc:
        logger.error("snapshot write failed: %s", exc)


async def _daily_refresh():
    """Sleeps until 08:00 local time, refreshes all DOSM data, then repeats daily."""
    while True:
        now    = datetime.now()
        target = now.replace(hour=8, minute=0, second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)
        wait = (target - now).total_seconds()
        logger.info("next refresh scheduled at %s (in %.0fs)", target.strftime("%Y-%m-%d %H:%M"), wait)
        await asyncio.sleep(wait)

        logger.info("08:00 daily refresh — clearing cache and re-fetching DOSM data")
        _cache.clear()
        for url in URLS_TO_PREFETCH:
            try:
                await fetch_parquet(url)
                logger.info("refreshed: %s", url)
            except Exception as exc:
                logger.error("refresh failed for %s: %s", url, exc)

        await _write_snapshot()


@app.on_event("startup")
async def startup():
    logger.info("pre-warming cache on startup")
    for url in URLS_TO_PREFETCH:
        try:
            await fetch_parquet(url)
        except Exception as exc:
            logger.warning("startup pre-warm failed for %s: %s", url, exc)
    await _write_snapshot()
    asyncio.create_task(_daily_refresh())


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    cached = {url: ts.isoformat() for url, (_, ts) in _cache.items()}
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "cache": cached}


# ── Fuel ─────────────────────────────────────────────────────────────────────

def _fuel_levels(df: pd.DataFrame) -> pd.DataFrame:
    """Return only the 'level' rows (actual prices, not weekly deltas)."""
    return df[df["series_type"] == "level"].sort_values("date")


@app.get("/api/fuel/latest")
async def fuel_latest():
    """
    Latest weekly retail prices.
    Columns in DOSM data:
      ron95          — market / unsubsidised pump price
      ron97          — RON97 pump price
      diesel         — Peninsular diesel
      diesel_eastmsia — Sabah/Sarawak diesel (subsidised flat rate)
      ron95_skps     — subsidised rate under SKPS (targeted subsidy programme)
      ron95_budi95   — BUDI Madani B40 rate
    """
    url = f"{DOSM_BASE}/commodities/fuelprice.parquet"
    try:
        df = _fuel_levels(_parse_dates(await fetch_parquet(url)))
    except httpx.HTTPError as e:
        raise HTTPException(502, f"DOSM upstream: {e}")

    row  = df.iloc[-1]
    prev = df.iloc[-2] if len(df) > 1 else row

    def f(val):
        return float(val) if not pd.isna(val) else None

    fetched_at = _cache.get(url, (None, None))[1]

    return {
        "date":              row["date"].strftime("%Y-%m-%d"),
        "ron95":             f(row["ron95"]),
        "ron97":             f(row["ron97"]),
        "diesel":            f(row["diesel"]),
        "diesel_eastmsia":   f(row["diesel_eastmsia"]),
        "ron95_skps":        f(row["ron95_skps"]),
        "ron95_budi95":      f(row["ron95_budi95"]),
        "prev_date":         prev["date"].strftime("%Y-%m-%d"),
        "prev_ron95":        f(prev["ron95"]),
        "weekly_change_ron95": f(row["ron95"] - prev["ron95"]),
        "fetched_at":        fetched_at.isoformat() if fetched_at else None,
    }


@app.get("/api/fuel/history")
async def fuel_history(weeks: int = Query(12, ge=1, le=104)):
    """Weekly price history (level rows only) for the last N weeks."""
    url = f"{DOSM_BASE}/commodities/fuelprice.parquet"
    try:
        df = _fuel_levels(_parse_dates(await fetch_parquet(url)))
    except httpx.HTTPError as e:
        raise HTTPException(502, f"DOSM upstream: {e}")

    cutoff = datetime.now() - timedelta(weeks=weeks)
    df = df[df["date"] >= cutoff].copy()
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    price_cols = ["date", "ron95", "ron97", "diesel", "diesel_eastmsia", "ron95_skps", "ron95_budi95"]
    return df[[c for c in price_cols if c in df.columns]].to_dict(orient="records")


# ── Commodities ───────────────────────────────────────────────────────────────

# Keyword map → dashboard item IDs
ITEM_KEYWORDS: dict[str, list[str]] = {
    "rice":       ["beras super", "beras tempatan super"],
    "cookingoil": ["minyak masak sawit", "minyak masak"],
    "chicken":    ["ayam standard", "ayam segar"],
    "onion":      ["bawang merah besar", "bawang merah"],
    "egg":        ["telur ayam gred a", "telur ayam"],
    "sugar":      ["gula putih berkilang", "gula putih"],
}

ITEM_EMOJI: dict[str, str] = {
    "rice": "🌾", "cookingoil": "🫙", "chicken": "🍗",
    "onion": "🧅", "egg": "🥚", "sugar": "🍬",
}


@app.get("/api/commodities")
async def commodities():
    """
    Median retail prices per commodity for the latest available month
    versus the prior month, with MoM % change.
    """
    try:
        df = _parse_dates(await _latest_pricecatcher())
        lookup = _parse_dates(await fetch_parquet(f"{DOSM_BASE}/commodities/lookup_item.parquet"))
    except httpx.HTTPError as e:
        raise HTTPException(502, f"DOSM upstream: {e}")

    # Merge item names from lookup
    if "item_code" in df.columns and "item_code" in lookup.columns:
        item_cols = [c for c in ["item_code", "item", "unit"] if c in lookup.columns]
        df = df.merge(lookup[item_cols], on="item_code", how="left")

    latest_date = df["date"].max()
    prev_cutoff = latest_date - timedelta(days=30)

    results = []
    for item_id, keywords in ITEM_KEYWORDS.items():
        pattern = "|".join(keywords)
        mask = df["item"].str.lower().str.contains(pattern, na=False)
        item_df = df[mask]
        if item_df.empty:
            continue

        current_price = item_df[
            item_df["date"] >= latest_date - timedelta(days=7)
        ]["price"].median()

        prev_price = item_df[
            (item_df["date"] >= prev_cutoff - timedelta(days=7))
            & (item_df["date"] <= prev_cutoff + timedelta(days=7))
        ]["price"].median()

        change = _pct(current_price, prev_price)
        trend = "up" if change and change > 0 else "down" if change and change < 0 else "flat"

        unit = item_df["unit"].dropna().iloc[0] if "unit" in item_df.columns and not item_df["unit"].dropna().empty else ""

        results.append({
            "id": item_id,
            "emoji": ITEM_EMOJI[item_id],
            "name": item_df["item"].dropna().iloc[0] if not item_df["item"].dropna().empty else item_id,
            "price": round(float(current_price), 2) if not pd.isna(current_price) else None,
            "unit": unit,
            "change_pct": change,
            "trend": trend,
            "as_of": latest_date.strftime("%Y-%m-%d"),
        })

    return results


@app.get("/api/commodities/lookup")
async def commodities_lookup():
    """Full item lookup table from DOSM pricecatcher."""
    try:
        df = await fetch_parquet(f"{DOSM_BASE}/commodities/lookup_item.parquet")
    except httpx.HTTPError as e:
        raise HTTPException(502, f"DOSM upstream: {e}")
    return df.to_dict(orient="records")


@app.get("/api/commodities/raw")
async def commodities_raw(month: Optional[str] = Query(None, description="YYYY-MM, defaults to latest")):
    """
    Raw pricecatcher data for a given month.
    Useful for exploring the schema before mapping item codes.
    """
    if month:
        url = f"{DOSM_BASE}/commodities/pricecatcher_{month}.parquet"
        try:
            df = _parse_dates(await fetch_parquet(url))
        except httpx.HTTPError as e:
            raise HTTPException(502, f"DOSM upstream: {e}")
    else:
        df = _parse_dates(await _latest_pricecatcher())

    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    return {
        "month": month or df["date"].max(),
        "rows": len(df),
        "columns": list(df.columns),
        "sample": df.head(20).to_dict(orient="records"),
    }


# ── Macro ─────────────────────────────────────────────────────────────────────

@app.get("/api/macro")
async def macro():
    """Live macro data: MYR/USD (BNM), CPI/PPI/Trade (DOSM data catalogue)."""
    out: dict = {}

    # 1. MYR/USD — BNM (current rate) + FRED DEXMAUS (historical change)
    try:
        bnm = await fetch_json(
            BNM_EXCHANGE_URL,
            headers={"Accept": "application/vnd.BNM.API.v1+json"},
        )
        usd = next((c for c in bnm.get("data", []) if c["currency_code"] == "USD"), None)
        if usd:
            cur_rate = usd["rate"]["middle_rate"]
            # Compute MoM change from FRED daily history
            change_pct = None
            try:
                fred = await fetch_fred_myr_usd()
                if len(fred) >= 22:
                    mom_base = fred[-22][1]
                    change_pct = round((cur_rate - mom_base) / mom_base * 100, 2)
            except Exception as fred_exc:
                logger.warning("FRED MYR/USD failed: %s", fred_exc)
            out["myr_usd"] = {
                "value":      cur_rate,
                "change_pct": change_pct,
                "trend":      _trend(change_pct),
                "date":       usd["rate"]["date"],
            }
    except Exception as exc:
        logger.warning("BNM fetch failed: %s", exc)

    # 2. CPI — DOSM cpi_headline catalogue
    try:
        rows = await fetch_json(f"{DOSM_CATALOGUE}?id=cpi_headline&limit=500&sort=-date")
        by_div: dict[str, dict[str, float]] = {}
        for r in rows:
            by_div.setdefault(r["division"], {})[r["date"]] = r["index"]

        def _cpi_stat(division: str) -> Optional[dict]:
            idx = by_div.get(division, {})
            if not idx:
                return None
            dates = sorted(idx.keys(), reverse=True)
            d0 = dates[0]
            def yoy(curr: str, base: str) -> Optional[float]:
                c, p = idx.get(curr), idx.get(base)
                return round((c - p) / p * 100, 1) if c and p else None
            cur_yoy  = yoy(d0, _add_months(d0, -12))
            prev_yoy = yoy(_add_months(d0, -1), _add_months(d0, -13))
            chg = round(cur_yoy - prev_yoy, 1) if cur_yoy is not None and prev_yoy is not None else None
            return {"value": cur_yoy, "change_pp": chg, "trend": _trend(chg), "date": d0}

        out["cpi"] = {"overall": _cpi_stat("overall"), "food": _cpi_stat("01")}
    except Exception as exc:
        logger.warning("CPI fetch failed: %s", exc)

    # 3. PPI — DOSM ppi catalogue (growth_yoy series)
    try:
        rows = await fetch_json(f"{DOSM_CATALOGUE}?id=ppi&limit=20&sort=-date")
        latest = max(r["date"] for r in rows)
        prev   = _add_months(latest, -1)
        by_ds  = {(r["date"], r["series"]): r for r in rows}
        yoy_cur  = by_ds.get((latest, "growth_yoy"), {}).get("index")
        yoy_prev = by_ds.get((prev,   "growth_yoy"), {}).get("index")
        chg = round(yoy_cur - yoy_prev, 1) if yoy_cur is not None and yoy_prev is not None else None
        out["ppi"] = {
            "value":     round(yoy_cur, 1) if yoy_cur is not None else None,
            "change_pp": chg,
            "trend":     _trend(chg),
            "date":      latest,
        }
    except Exception as exc:
        logger.warning("PPI fetch failed: %s", exc)

    # 4. Trade — DOSM trade_headline catalogue
    try:
        rows = await fetch_json(f"{DOSM_CATALOGUE}?id=trade_headline&limit=200&sort=-date")
        latest = max(r["date"] for r in rows)
        by_ds  = {(r["date"], r["series"]): r for r in rows}
        abs_r  = by_ds.get((latest, "abs"), {})
        yoy_r  = by_ds.get((latest, "growth_yoy"), {})

        def b(x):
            return round(float(x) / 1e9, 1) if x is not None else None

        year = latest[:4]
        ytd_abs = [by_ds[(d, "abs")] for d in {r["date"] for r in rows}
                   if d.startswith(year) and (d, "abs") in by_ds]
        ytd_exp = round(sum(r["exports"] for r in ytd_abs) / 1e9, 1) if ytd_abs else None
        ytd_imp = round(sum(r["imports"] for r in ytd_abs) / 1e9, 1) if ytd_abs else None
        ytd_bal = round(sum(r["balance"] for r in ytd_abs) / 1e9, 1) if ytd_abs else None

        prev_year = str(int(year) - 1)
        ytd_months = {d for d in {r["date"] for r in rows} if d.startswith(year)}
        prev_ytd_abs = [by_ds[(d.replace(year, prev_year), "abs")]
                        for d in ytd_months
                        if (d.replace(year, prev_year), "abs") in by_ds]
        prev_ytd_exp = sum(r["exports"] for r in prev_ytd_abs) / 1e9 if prev_ytd_abs else None
        prev_ytd_imp = sum(r["imports"] for r in prev_ytd_abs) / 1e9 if prev_ytd_abs else None
        ytd_exp_yoy = round((ytd_exp - prev_ytd_exp) / prev_ytd_exp * 100, 1) if ytd_exp and prev_ytd_exp else None
        ytd_imp_yoy = round((ytd_imp - prev_ytd_imp) / prev_ytd_imp * 100, 1) if ytd_imp and prev_ytd_imp else None

        month_label = datetime.strptime(latest, "%Y-%m-%d").strftime("%b %Y")
        out["trade"] = {
            "date":         latest,
            "month_label":  month_label,
            "exports":      b(abs_r.get("exports")),
            "imports":      b(abs_r.get("imports")),
            "balance":      b(abs_r.get("balance")),
            "exports_yoy":  yoy_r.get("exports"),
            "imports_yoy":  yoy_r.get("imports"),
            "balance_yoy":  yoy_r.get("balance"),
            "ytd_exports":  ytd_exp,
            "ytd_imports":  ytd_imp,
            "ytd_balance":  ytd_bal,
            "ytd_exp_yoy":  ytd_exp_yoy,
            "ytd_imp_yoy":  ytd_imp_yoy,
        }
    except Exception as exc:
        logger.warning("Trade fetch failed: %s", exc)

    # 5. Brent & WTI crude oil — EIA open data (DEMO_KEY)
    try:
        rows = await fetch_eia_oil(length=600)
        # Group by series, descending by period
        by_series: dict[str, list[dict]] = {}
        for r in rows:
            by_series.setdefault(r["series"], []).append(r)
        # Already desc-sorted; ensure it
        for s in by_series:
            by_series[s].sort(key=lambda r: r["period"], reverse=True)

        def _oil_stat(series: str) -> Optional[dict]:
            pts = by_series.get(series, [])
            if not pts:
                return None
            latest = pts[0]
            cur_val = float(latest["value"])
            # WoW: latest point at least 7 calendar days back
            from datetime import date as date_type
            latest_d = date_type.fromisoformat(latest["period"])
            wow_pt = next(
                (p for p in pts[1:]
                 if (latest_d - date_type.fromisoformat(p["period"])).days >= 7),
                None,
            )
            wow_pct = round((cur_val - float(wow_pt["value"])) / float(wow_pt["value"]) * 100, 1) \
                      if wow_pt else None
            # 52-week high/low from last 260 trading days
            window = [float(p["value"]) for p in pts[:260]]
            wk_high = round(max(window), 2) if window else None
            wk_low  = round(min(window), 2) if window else None
            return {
                "value":   cur_val,
                "change_pct": wow_pct,
                "trend":   _trend(wow_pct),
                "wk_high": wk_high,
                "wk_low":  wk_low,
                "date":    latest["period"],
            }

        out["brent"] = _oil_stat("RBRTE")
        out["wti"]   = _oil_stat("RWTC")
    except Exception as exc:
        logger.warning("EIA fetch failed: %s", exc)

    return out


@app.get("/api/macro/myr-usd/history")
async def myr_usd_history(days: int = Query(90, ge=7, le=365)):
    """MYR/USD daily history from FRED DEXMAUS (excludes weekends/holidays)."""
    cache_key = "fred_dexmaus_full"
    cached = _json_cache.get(cache_key)
    if cached:
        data, ts = cached
        if datetime.now() - ts < CACHE_TTL:
            return data[-days:]

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(FRED_DEXMAUS_URL)
            resp.raise_for_status()
        rows = []
        for line in resp.text.strip().split("\n")[1:]:
            parts = line.strip().split(",")
            if len(parts) == 2 and parts[1] not in (".", "", " "):
                try:
                    rows.append({"date": parts[0], "value": float(parts[1])})
                except ValueError:
                    pass
        _json_cache[cache_key] = (rows, datetime.now())
        return rows[-days:]
    except Exception as exc:
        raise HTTPException(502, f"FRED fetch failed: {exc}")
