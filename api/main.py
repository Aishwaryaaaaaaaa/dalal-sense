from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model        = joblib.load("data/model.pkl")
FEATURE_COLS = joblib.load("data/feature_cols.pkl")

class StockInput(BaseModel):
    symbol:           str
    roce:             float
    roe:              float
    revenue_cagr:     float
    profit_cagr:      float
    debt_to_equity:   float
    promoter_holding: float
    pe_ratio:         float

@app.get("/scores")
def get_scores():
    df = pd.read_csv("data/scores.csv")
    return df.to_dict(orient="records")

@app.post("/score")
def score_stock(stock: StockInput):
    inputs = np.array([[
        stock.roce, stock.roe, stock.revenue_cagr,
        stock.profit_cagr, stock.debt_to_equity,
        stock.promoter_holding, stock.pe_ratio
    ]])
    prob  = model.predict_proba(inputs)[0][1]
    score = round(prob * 100, 1)

    if score >= 75:
        label   = "Strong compounder"
        verdict = "This stock shows the financial DNA of a long-term compounder."
    elif score >= 50:
        label   = "Watch closely"
        verdict = "Decent fundamentals but not a clear compounder yet."
    else:
        label   = "Weak fundamentals"
        verdict = "Key metrics are below compounder benchmarks."

    return {
        "symbol":           stock.symbol.upper(),
        "compounder_score": score,
        "label":            label,
        "verdict":          verdict,
        "factors": [
            {"name": "ROCE",             "value": stock.roce,             "threshold": 15,  "higher_better": True},
            {"name": "Revenue CAGR",     "value": stock.revenue_cagr,     "threshold": 15,  "higher_better": True},
            {"name": "Promoter holding", "value": stock.promoter_holding, "threshold": 45,  "higher_better": True},
            {"name": "Debt / Equity",    "value": stock.debt_to_equity,   "threshold": 1.0, "higher_better": False},
            {"name": "ROE",              "value": stock.roe,              "threshold": 15,  "higher_better": True},
            {"name": "Stock P/E",        "value": stock.pe_ratio,         "threshold": 60,  "higher_better": False},
        ]
    }

@app.get("/")
def root():
    return {"status": "Dalal Sense API running"}