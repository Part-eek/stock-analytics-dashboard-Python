# NIFTY 50 Stock Analytics Dashboard

## Project Structure

- `frontend/`
  - `index.html` — Dashboard UI
  - `css/style.css` — Styling
  - `js/app.js` — API integration and page logic
  - `js/charts.js` — Plotly chart rendering
  - `js/animations.js` — page animation utilities
- `backend/`
  - `Python code.py` — Main backend file with data fetching, cleaning, processing, analytics, and API endpoints
  - `requirements.txt` — Python dependencies

## Run Instructions

### 1. Start the backend API

Open a terminal in the project root and run:

```powershell
cd "c:\Users\partg\OneDrive\Desktop\Python Project\backend"
python "Python code.py"
```

This launches the FastAPI backend at `http://127.0.0.1:8000`.

### 2. Start the frontend static server

Open a separate terminal in the project root and run:

```powershell
cd "c:\Users\partg\OneDrive\Desktop\Python Project\frontend"
python -m http.server 5500
```

Then open in your browser:

```text
http://127.0.0.1:5500/index.html
```

## Notes

- The dashboard UI is unchanged from the original design.
- The `Deploy` button has been removed; the new app uses a standalone frontend + backend architecture.
- All chart styles, metrics, and behavior have been preserved using the same theme and data logic.
