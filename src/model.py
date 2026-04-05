import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
import joblib

FEATURE_COLS = [
    "roce", "roe", "revenue_cagr", "profit_cagr",
    "debt_to_equity", "promoter_holding", "pe_ratio",
    "pe_penalty", "valuation_score"
]

def train(path="data/manual_data.csv"):
    df = pd.read_csv(path)
    df = df.dropna(subset=["revenue_cagr", "profit_cagr", "roce", "promoter_holding"])

    labelled   = df[df["label"].notna()].copy()
    unlabelled = df[df["label"].isna()].copy()

    print(f"Labelled stocks:   {len(labelled)}")
    print(f"Unlabelled stocks: {len(unlabelled)}")
    print(f"Unlabelled:        {list(unlabelled['symbol'])}\n")

    labelled['pe_penalty']      = (labelled['pe_ratio'] > 45).astype(int)
    unlabelled['pe_penalty']    = (unlabelled['pe_ratio'] > 45).astype(int)

    labelled['valuation_score']   = labelled['roce'] / (labelled['pe_ratio'] + 1)
    unlabelled['valuation_score'] = unlabelled['roce'] / (unlabelled['pe_ratio'] + 1)

    for col in FEATURE_COLS:
        med = labelled[col].median()
        labelled[col]   = labelled[col].fillna(med)
        unlabelled[col] = unlabelled[col].fillna(med)

    X = labelled[FEATURE_COLS].values
    y = labelled["label"].values.astype(int)

    model = RandomForestClassifier(
        n_estimators=500,
        max_depth=4,
        min_samples_leaf=2,
        random_state=42
    )
<div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:'2rem'}}>
        {[
          ['Stocks scored',  stocks.length, '#7F77DD'],
          ['Score above 75', strong,        '#1D9E75'],
          ['Score below 40', weak,          '#E24B4A'],
        ].map(([label, val, color]) => (
          <div key={label} style={{background:'#111', border:'1px solid #1e1e1e',
                                   borderRadius:12, padding:'1rem 1.25rem'}}>
            <div style={{fontSize:11, color:'#555', marginBottom:6,
                         textTransform:'uppercase', letterSpacing:'0.06em'}}>{label}</div>
            <div style={{fontSize:28, fontWeight:600, color}}>{val}</div>
          </div>
        ))}
      </div>
def score_all(model, unlabelled):
    if unlabelled.empty:
        print("No stocks to score.")
        return

    X      = unlabelled[FEATURE_COLS].values
    probs  = model.predict_proba(X)[:, 1]
    scores = (probs * 100).round(1)

    results = unlabelled[["symbol"] + FEATURE_COLS].copy()
    results["compounder_score"] = scores

    # Valuation cap — no stock with PE > 50 can score above 90
    high_pe = results["pe_ratio"] > 50
    results.loc[high_pe, "compounder_score"] = results.loc[high_pe, "compounder_score"].clip(upper=88)

    # Revenue cap — no stock with negative revenue CAGR can score above 70
    neg_rev = results["revenue_cagr"] < 0
    results.loc[neg_rev, "compounder_score"] = results.loc[neg_rev, "compounder_score"].clip(upper=70)

    results = results.sort_values("compounder_score", ascending=False)
    results.to_csv("data/scores.csv", index=False)

    print("--- Compounder Scores ---")
    print(results[["symbol", "compounder_score", "roce",
                   "revenue_cagr", "promoter_holding"]].to_string(index=False))
    return results


if __name__ == "__main__":
    model, labelled, unlabelled = train()
    score_all(model, unlabelled)