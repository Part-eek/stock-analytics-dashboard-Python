# ============================================================================
#  NIFTY 50 STOCK ANALYTICS BACKEND
#  ---------------------------------
#  FastAPI backend for the NIFTY 50 analytics dashboard.
#  All data fetching, cleaning, transformation, analytics, and API
#  endpoints remain in this single Python file.
# ============================================================================

import yfinance as yf
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from typing import List
import uvicorn
import os

# ─────────────────────────────────────────────────────────────────────────────
# NIFTY 50 COMPANIES
# ─────────────────────────────────────────────────────────────────────────────
NIFTY_50_COMPANIES = {
    "RELIANCE.NS":  "Reliance Industries",
    "TCS.NS":       "Tata Consultancy Services",
    "HDFCBANK.NS":  "HDFC Bank",
    "INFY.NS":      "Infosys",
    "ICICIBANK.NS": "ICICI Bank",
    "HINDUNILVR.NS":"Hindustan Unilever",
    "ITC.NS":       "ITC Limited",
    "SBIN.NS":      "State Bank of India",
    "BHARTIARTL.NS":"Bharti Airtel",
    "KOTAKBANK.NS": "Kotak Mahindra Bank",
    "LT.NS":        "Larsen & Toubro",
    "AXISBANK.NS":  "Axis Bank",
    "WIPRO.NS":     "Wipro",
    "HCLTECH.NS":   "HCL Technologies",
    "ASIANPAINT.NS":"Asian Paints",
    "MARUTI.NS":    "Maruti Suzuki",
    "SUNPHARMA.NS": "Sun Pharma",
    "TATAMOTORS.NS":"Tata Motors",
    "ULTRACEMCO.NS":"UltraTech Cement",
    "TITAN.NS":     "Titan Company",
    "BAJFINANCE.NS":"Bajaj Finance",
    "NESTLEIND.NS": "Nestle India",
    "TATASTEEL.NS": "Tata Steel",
    "POWERGRID.NS": "Power Grid Corp",
    "NTPC.NS":      "NTPC Limited",
    "M&M.NS":       "Mahindra & Mahindra",
    "TECHM.NS":     "Tech Mahindra",
    "ONGC.NS":      "ONGC",
    "JSWSTEEL.NS":  "JSW Steel",
    "HDFCLIFE.NS":  "HDFC Life Insurance",
    "DIVISLAB.NS":  "Divi's Laboratories",
    "BAJAJFINSV.NS":"Bajaj Finserv",
    "GRASIM.NS":    "Grasim Industries",
    "CIPLA.NS":     "Cipla",
    "ADANIENT.NS":  "Adani Enterprises",
    "ADANIPORTS.NS":"Adani Ports",
    "SBILIFE.NS":   "SBI Life Insurance",
    "BRITANNIA.NS": "Britannia Industries",
    "DRREDDY.NS":   "Dr. Reddy's Labs",
    "EICHERMOT.NS": "Eicher Motors",
    "INDUSINDBK.NS":"IndusInd Bank",
    "APOLLOHOSP.NS":"Apollo Hospitals",
    "COALINDIA.NS": "Coal India",
    "BPCL.NS":      "BPCL",
    "TATACONSUM.NS":"Tata Consumer Products",
    "HEROMOTOCO.NS":"Hero MotoCorp",
    "LTIM.NS":      "LTIMindtree",
    "SHRIRAMFIN.NS":"Shriram Finance",
    "HINDALCO.NS":  "Hindalco Industries",
    "BAJAJ-AUTO.NS":"Bajaj Auto"
}

VALID_PERIODS = ["1mo", "3mo", "6mo", "1y", "2y", "5y"]

app = FastAPI(
    title="NIFTY 50 Stock Analytics API",
    description="Backend API for the NIFTY 50 Stock Analytics Dashboard",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# DATA COLLECTION
# ─────────────────────────────────────────────────────────────────────────────

def fetch_stock_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    """Fetches historical stock data from Yahoo Finance."""
    ticker = ticker.strip().upper()
    if ticker not in NIFTY_50_COMPANIES:
        raise ValueError(f"Ticker '{ticker}' is not a valid NIFTY 50 symbol.")

    if period not in VALID_PERIODS:
        raise ValueError(f"Period '{period}' is not valid. Choose from {VALID_PERIODS}.")

    stock = yf.Ticker(ticker)
    data = stock.history(period=period)
    return data


# ─────────────────────────────────────────────────────────────────────────────
# DATA CLEANING
# ─────────────────────────────────────────────────────────────────────────────

def clean_data(df: pd.DataFrame):
    """Cleans raw stock data before analytics."""
    if df.empty:
        return df, {
            "original_rows": 0,
            "cleaned_rows": 0,
            "duplicates_removed": 0,
            "missing_values": 0,
            "outliers_capped": 0,
        }

    original_rows = len(df)
    df = df.drop_duplicates()
    missing_before = int(df.isnull().sum().sum())
    df = df.ffill().bfill()

    outliers_removed = 0
    numeric_cols = ["Open", "High", "Low", "Close", "Volume"]
    for col in numeric_cols:
        if col in df.columns:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - 3 * iqr
            upper = q3 + 3 * iqr
            mask = (df[col] < lower) | (df[col] > upper)
            outliers_removed += int(mask.sum())
            df[col] = df[col].clip(lower=lower, upper=upper)
            df[col] = pd.to_numeric(df[col], errors="coerce")

    summary = {
        "original_rows": original_rows,
        "cleaned_rows": len(df),
        "duplicates_removed": int(original_rows - len(df)),
        "missing_values": missing_before,
        "outliers_capped": outliers_removed,
    }
    return df, summary


# ─────────────────────────────────────────────────────────────────────────────
# DATA TRANSFORMATION
# ─────────────────────────────────────────────────────────────────────────────

def transform_data(df: pd.DataFrame) -> pd.DataFrame:
    """Adds analytics features to the cleaned data."""
    if df.empty or len(df) < 2:
        return df

    df = df.copy()
    df["Daily_Return"] = df["Close"].pct_change() * 100
    df["Cumulative_Return"] = ((1 + df["Daily_Return"] / 100).cumprod() - 1) * 100
    df["SMA_20"] = df["Close"].rolling(window=20).mean()
    df["SMA_50"] = df["Close"].rolling(window=50).mean()
    df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()
    df["BB_Middle"] = df["SMA_20"]
    df["BB_Std"] = df["Close"].rolling(window=20).std()
    df["BB_Upper"] = df["BB_Middle"] + 2 * df["BB_Std"]
    df["BB_Lower"] = df["BB_Middle"] - 2 * df["BB_Std"]

    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))

    df["Trend"] = np.where(
        df["Daily_Return"] > 0.5,
        "Bullish",
        np.where(df["Daily_Return"] < -0.5, "Bearish", "Neutral"),
    )
    df["Volume_MA"] = df["Volume"].rolling(window=20).mean()
    return df


# ─────────────────────────────────────────────────────────────────────────────
# INSIGHT GENERATION
# ─────────────────────────────────────────────────────────────────────────────

def generate_insights(df: pd.DataFrame, company_name: str) -> dict:
    """Generates key metrics and analytics insights."""
    if df.empty or len(df) < 5:
        return {}

    insights = {
        "company_name": company_name,
        "highest_price": round(df["Close"].max(), 2),
        "lowest_price": round(df["Close"].min(), 2),
        "average_price": round(df["Close"].mean(), 2),
        "current_price": round(df["Close"].iloc[-1], 2),
    }

    insights["price_range"] = round(insights["highest_price"] - insights["lowest_price"], 2)
    insights["highest_date"] = df["Close"].idxmax().strftime("%d %b %Y")
    insights["lowest_date"] = df["Close"].idxmin().strftime("%d %b %Y")

    start_price = df["Close"].iloc[0]
    end_price = df["Close"].iloc[-1]
    total_return = round(((end_price - start_price) / start_price) * 100, 2)
    insights["total_return"] = total_return
    insights["overall_trend"] = "📈 Upward" if total_return > 0 else "📉 Downward"

    volatility = round(df["Daily_Return"].std(), 2) if "Daily_Return" in df.columns else 0
    insights["volatility"] = volatility
    insights["volatility_level"] = (
        "🔴 High Volatility" if volatility > 3 else
        "🟡 Moderate Volatility" if volatility > 1.5 else
        "🟢 Low Volatility"
    )

    insights["avg_volume"] = int(df["Volume"].mean())
    insights["max_volume"] = int(df["Volume"].max())
    insights["max_volume_date"] = df["Volume"].idxmax().strftime("%d %b %Y")

    if "RSI" in df.columns:
        current_rsi = round(df["RSI"].iloc[-1], 2)
        insights["rsi"] = current_rsi
        insights["rsi_signal"] = (
            "⚠️ Overbought (RSI > 70) — price may correct downward"
            if current_rsi > 70 else
            "⚠️ Oversold (RSI < 30) — price may bounce upward"
            if current_rsi < 30 else
            "✅ Neutral zone"
        )

    trend_counts = df["Trend"].value_counts() if "Trend" in df.columns else pd.Series(dtype=int)
    insights["bullish_days"] = int(trend_counts.get("Bullish", 0))
    insights["bearish_days"] = int(trend_counts.get("Bearish", 0))
    insights["neutral_days"] = int(trend_counts.get("Neutral", 0))

    return insights


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTIVE ANALYTICS
# ─────────────────────────────────────────────────────────────────────────────

def predict_trend(df: pd.DataFrame):
    """Predictive signal using SMA crossover logic."""
    if df.empty or "SMA_20" not in df.columns or "SMA_50" not in df.columns:
        return "Insufficient data for prediction", "neutral"

    sma_20 = df["SMA_20"].dropna()
    sma_50 = df["SMA_50"].dropna()
    if len(sma_20) < 2 or len(sma_50) < 2:
        return "Not enough data points for SMA analysis", "neutral"

    latest_sma20 = sma_20.iloc[-1]
    latest_sma50 = sma_50.iloc[-1]
    prev_sma20 = sma_20.iloc[-2]
    prev_sma50 = sma_50.iloc[-2]

    if latest_sma20 > latest_sma50 and prev_sma20 <= prev_sma50:
        return (
            "🟢 GOLDEN CROSS detected! 20-day SMA crossed above 50-day SMA. "
            "This is a bullish signal — historically indicates an upward trend."), "bullish"
    if latest_sma20 < latest_sma50 and prev_sma20 >= prev_sma50:
        return (
            "🔴 DEATH CROSS detected! 20-day SMA crossed below 50-day SMA. "
            "This is a bearish signal — historically indicates a downward trend."), "bearish"
    if latest_sma20 > latest_sma50:
        return (
            "🟢 Bullish Configuration: 20-day SMA is above 50-day SMA. "
            f"Short-term momentum is positive. Gap: ₹{round(latest_sma20 - latest_sma50, 2)}"), "bullish"
    return (
        "🔴 Bearish Configuration: 20-day SMA is below 50-day SMA. "
        f"Short-term momentum is negative. Gap: ₹{round(latest_sma50 - latest_sma20, 2)}"), "bearish"


# ─────────────────────────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def dates_to_strings(df: pd.DataFrame) -> list:
    return [dt.strftime("%Y-%m-%d") for dt in df.index]


def safe_list(series: pd.Series) -> list:
    return [None if pd.isna(value) else float(value) for value in series]


def build_chart_payload(df: pd.DataFrame) -> dict:
    if df.empty or len(df) == 0:
        return {
            "dates": [],
            "open": [],
            "high": [],
            "low": [],
            "close": [],
            "volume": [],
            "sma20": [],
            "sma50": [],
            "volume_ma": [],
            "bb_upper": [],
            "bb_lower": [],
            "daily_return": [],
            "rsi": [],
            "trend": [],
            "high_point": {},
            "low_point": {},
        }
    
    dates = dates_to_strings(df)
    
    high_point = {}
    try:
        if not df["Close"].empty:
            max_idx = df["Close"].idxmax()
            high_point = {
                "date": max_idx.strftime("%Y-%m-%d") if hasattr(max_idx, 'strftime') else str(max_idx),
                "value": float(df["Close"].max()),
            }
    except:
        high_point = {}
    
    low_point = {}
    try:
        if not df["Close"].empty:
            min_idx = df["Close"].idxmin()
            low_point = {
                "date": min_idx.strftime("%Y-%m-%d") if hasattr(min_idx, 'strftime') else str(min_idx),
                "value": float(df["Close"].min()),
            }
    except:
        low_point = {}
    
    return {
        "dates": dates,
        "open": safe_list(df["Open"]) if "Open" in df.columns else [],
        "high": safe_list(df["High"]) if "High" in df.columns else [],
        "low": safe_list(df["Low"]) if "Low" in df.columns else [],
        "close": safe_list(df["Close"]) if "Close" in df.columns else [],
        "volume": safe_list(df["Volume"]) if "Volume" in df.columns else [],
        "sma20": safe_list(df["SMA_20"]) if "SMA_20" in df.columns else [],
        "sma50": safe_list(df["SMA_50"]) if "SMA_50" in df.columns else [],
        "volume_ma": safe_list(df["Volume_MA"]) if "Volume_MA" in df.columns else [],
        "bb_upper": safe_list(df["BB_Upper"]) if "BB_Upper" in df.columns else [],
        "bb_lower": safe_list(df["BB_Lower"]) if "BB_Lower" in df.columns else [],
        "daily_return": safe_list(df["Daily_Return"]) if "Daily_Return" in df.columns else [],
        "rsi": safe_list(df["RSI"]) if "RSI" in df.columns else [],
        "trend": df["Trend"].fillna("N/A").tolist() if "Trend" in df.columns else [],
        "high_point": high_point,
        "low_point": low_point,
    }


def dataframe_to_table(df: pd.DataFrame, rows: int = 50) -> list:
    if df.empty:
        return []
    display_cols = ["Open", "High", "Low", "Close", "Volume"]
    if "Daily_Return" in df.columns:
        display_cols.append("Daily_Return")
    if "SMA_20" in df.columns:
        display_cols.append("SMA_20")
    if "SMA_50" in df.columns:
        display_cols.append("SMA_50")
    if "RSI" in df.columns:
        display_cols.append("RSI")
    if "Trend" in df.columns:
        display_cols.append("Trend")

    available_cols = [col for col in display_cols if col in df.columns]
    if not available_cols:
        return []

    preview_df = df[available_cols].tail(rows)
    preview_df = preview_df.round(2)
    preview_df.index = preview_df.index.strftime("%Y-%m-%d")
    return [
        {"date": date, **{col: (None if pd.isna(value) else value) for col, value in row.items()}}
        for date, row in preview_df.iterrows()
    ]


def get_summary_statistics(df: pd.DataFrame) -> dict:
    cols = ["Open", "High", "Low", "Close", "Volume"]
    available = [col for col in cols if col in df.columns]
    if not available:
        return {}
    summary = df[available].describe().round(2).fillna("")
    return summary.to_dict(orient="index")


# ─────────────────────────────────────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/companies")
def get_companies():
    return {
        "companies": [
            {"ticker": ticker, "name": name}
            for ticker, name in NIFTY_50_COMPANIES.items()
        ]
    }


@app.get("/api/stock")
def get_stock_data(
    ticker: str = Query(..., description="Ticker symbol for the selected company."),
    period: str = Query("1y", description="Time period to fetch data for."),
):
    try:
        raw = fetch_stock_data(ticker, period)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {exc}")

    if raw.empty:
        raise HTTPException(status_code=404, detail="No data returned from Yahoo Finance.")

    cleaned, cleaning_summary = clean_data(raw.copy())
    transformed = transform_data(cleaned.copy())
    insights = generate_insights(transformed, NIFTY_50_COMPANIES[ticker])
    prediction, signal = predict_trend(transformed)

    return {
        "company_name": NIFTY_50_COMPANIES[ticker],
        "ticker": ticker,
        "period": period,
        "cleaning_summary": cleaning_summary,
        "insights": insights,
        "prediction": prediction,
        "prediction_signal": signal,
        "chart_data": build_chart_payload(transformed),
        "summary_statistics": get_summary_statistics(transformed),
        "raw_preview": dataframe_to_table(transformed, rows=50),
    }


@app.get("/api/compare")
def get_comparison_data(
    tickers: List[str] = Query(..., description="List of tickers to compare."),
    period: str = Query("1y", description="Time period to fetch data for."),
):
    tickers = [ticker.strip().upper() for ticker in tickers if ticker.strip()]
    if len(tickers) < 2:
        raise HTTPException(status_code=400, detail="Select at least two companies for comparison.")
    if len(tickers) > 5:
        raise HTTPException(status_code=400, detail="Maximum of 5 companies may be compared.")

    if any(ticker not in NIFTY_50_COMPANIES for ticker in tickers):
        raise HTTPException(status_code=400, detail="One or more tickers are not valid NIFTY 50 symbols.")

    comparison_series = []
    comparison_volume = []
    summary_rows = []

    for ticker in tickers:
        raw = fetch_stock_data(ticker, period)
        cleaned, _ = clean_data(raw.copy())
        transformed = transform_data(cleaned.copy())
        if transformed.empty:
            continue

        base = transformed["Close"].iloc[0]
        normalized = ((transformed["Close"] / base) * 100).round(2)
        comparison_series.append({
            "ticker": ticker,
            "name": NIFTY_50_COMPANIES[ticker],
            "dates": dates_to_strings(transformed),
            "normalized": safe_list(normalized),
        })

        # Add volume analysis data for multi-company comparison
        comparison_volume.append({
            "ticker": ticker,
            "name": NIFTY_50_COMPANIES[ticker],
            "dates": dates_to_strings(transformed),
            "volume": safe_list(transformed["Volume"]),
            "volume_ma": safe_list(transformed["Volume_MA"]) if "Volume_MA" in transformed.columns else [],
            "open": safe_list(transformed["Open"]),
            "close": safe_list(transformed["Close"]),
        })

        start_price = transformed["Close"].iloc[0]
        end_price = transformed["Close"].iloc[-1]
        summary_rows.append({
            "company": NIFTY_50_COMPANIES[ticker],
            "current_price": round(end_price, 2),
            "highest": round(transformed["Close"].max(), 2),
            "lowest": round(transformed["Close"].min(), 2),
            "return": round(((end_price - start_price) / start_price) * 100, 2),
            "avg_volume": int(transformed["Volume"].mean()),
            "volatility": round(transformed["Daily_Return"].std(), 2)
            if "Daily_Return" in transformed.columns else None,
        })

    if not comparison_series:
        raise HTTPException(status_code=404, detail="No valid comparison data available.")

    return {
        "comparison_series": comparison_series,
        "comparison_volume": comparison_volume,
        "comparison_summary": summary_rows,
    }


@app.get("/api/status")
def status():
    return {"status": "ok", "message": "NIFTY 50 API is running."}


# ─────────────────────────────────────────────────────────────────────────────
# SERVE FRONTEND STATIC FILES
# ─────────────────────────────────────────────────────────────────────────────

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")


@app.get("/")
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


# Mount static directories for CSS and JS
if os.path.isdir(os.path.join(FRONTEND_DIR, "css")):
    app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
if os.path.isdir(os.path.join(FRONTEND_DIR, "js")):
    app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENTRYPOINT
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
