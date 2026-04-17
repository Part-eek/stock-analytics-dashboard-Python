# NIFTY 50 Stock Analytics Dashboard - Setup Guide

## ✅ What's Fixed
This is a **frontend/backend architecture** that replaced the original Streamlit app.

**Fixed Issues:**
- ✅ Removed Deploy button (switched from Streamlit to HTML/CSS/JS)
- ✅ Port conflict resolved (backend now uses port 8001, not 8000)
- ✅ Syntax errors in app.js fixed (comparison feature now works)
- ✅ Company Comparison feature fully operational

## 🚀 How to Run

### Step 1: Open Terminal 1 (Backend)
```powershell
cd "c:\Users\partg\OneDrive\Desktop\Python Project\backend"
python "Python code.py"
```
**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

### Step 2: Open Terminal 2 (Frontend)
```powershell
cd "c:\Users\partg\OneDrive\Desktop\Python Project\frontend"
python -m http.server 5500
```
**Expected output:**
```
Serving HTTP on 0.0.0.0:5500 ...
```

### Step 3: Open Website
Navigate to: **http://127.0.0.1:5500/index.html**

---

## 📁 Project Structure

```
Python Project/
├── backend/
│   ├── Python code.py          ← Main API server (FastAPI)
│   └── requirements.txt
├── frontend/
│   ├── index.html              ← Main page
│   ├── css/
│   │   └── style.css           ← Styling
│   └── js/
│       ├── app.js              ← Main logic (FIXED)
│       ├── charts.js           ← Plotly charts
│       └── animations.js       ← UI animations
├── Python-code.py              ← Original file (backup)
└── SETUP_GUIDE.md              ← This file
```

---

## 🔧 Backend API (Port 8001)

| Endpoint | Purpose |
|----------|---------|
| `/api/companies` | Get all 50 NIFTY companies |
| `/api/stock?ticker=XXX.NS&period=1y` | Get single company analytics |
| `/api/compare?tickers=XXX.NS&tickers=YYY.NS&period=1y` | Compare 2-5 companies |

---

## ✨ Features Available

✅ **Single Company Analytics**
- 6 different chart types (Price Trend, Candlestick, Volume, Bollinger Bands, Returns, RSI)
- Key metrics (Current Price, Return %, High/Low, Volatility)
- Data cleaning report
- Insights & predictions

✅ **Company Comparison** (NEW - Now Working!)
- Select 2-5 companies from dropdown
- See normalized price comparison chart
- View summary statistics table
- Compare across different time periods

✅ **Interactive Controls**
- Company selector (50 NIFTY stocks)
- Time period selector (1mo, 3mo, 6mo, 1y, 2y, 5y)
- Chart visibility toggles
- Refresh button for manual updates
- Auto-refresh every 5 minutes

---

## 📊 Key Fixes Applied

### File: `frontend/js/app.js`
**Problem:** Syntax errors prevented JavaScript from loading
**Solution:** 
- Fixed missing closing braces in chart rendering section
- Added missing `if (settings.showReturns)` block
- Fixed duplicate comparison code
- Corrected `applyCompareLimit()` function

### File: `backend/Python code.py`
**Problem:** Port 8000 was already in use
**Solution:** Changed to port 8001

### Result
✅ JavaScript now loads properly
✅ All API endpoints accessible
✅ Comparison feature fully functional

---

## 🔍 Troubleshooting

**Problem:** "Website not loading" or "empty page"
- Make sure BOTH backend (port 8001) AND frontend (port 5500) servers are running
- Check browser console (F12) for errors

**Problem:** "Dashboard loading forever"
- Restart both servers
- Check backend terminal for error messages

**Problem:** "Charts not showing"
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (Ctrl+F5)

---

## 📝 Summary

✅ **All files saved and working**
✅ **Backend FastAPI server running on port 8001**
✅ **Frontend static server running on port 5500**
✅ **All 6 stock charts functional**
✅ **Company comparison working (2-5 companies)**
✅ **All 50 NIFTY stocks available**

**Just run the two Terminal commands above and open the URL!**
