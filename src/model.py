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

    cv = cross_val_score(model, X, y, cv=5, scoring="accuracy")
    print(f"Cross-val accuracy: {cv.round(2)}  →  Mean: {cv.mean():.2f}\n")

    model.fit(X, y)

    joblib.dump(model,        "data/model.pkl")
    joblib.dump(FEATURE_COLS, "data/feature_cols.pkl")
    print("Model saved.\n")

    return model, labelled, unlabelled


def score_all(model, unlabelled):
    if unlabelled.empty:
        print("No stocks to score.")
        return

    X      = unlabelled[FEATURE_COLS].values
    probs  = model.predict_proba(X)[:, 1]
    scores = (probs * 100).round(1)

    results = unlabelled[["symbol"] + FEATURE_COLS].copy()
    results["compounder_score"] = scores

    high_pe = results["pe_ratio"] > 50
    results.loc[high_pe, "compounder_score"] = results.loc[high_pe, "compounder_score"].clip(upper=88)

    neg_rev = results["revenue_cagr"] < 0
    results.loc[neg_rev, "compounder_score"] = results.loc[neg_rev, "compounder_score"].clip(upper=70)

    slow_growth = (results["revenue_cagr"] < 12) & (results["compounder_score"] > 85)
    results.loc[slow_growth, "compounder_score"] = results.loc[slow_growth, "compounder_score"].clip(upper=82)

    results = results.sort_values("compounder_score", ascending=False)
    results.to_csv("data/scores.csv", index=False)

    print("--- Compounder Scores ---")
    print(results[["symbol", "compounder_score", "roce",
                   "revenue_cagr", "promoter_holding"]].to_string(index=False))
    return results


if __name__ == "__main__":
    model, labelled, unlabelled = train()
    score_all(model, unlabelled)