import pandas as pd
import numpy as np

def build_features(df):
    f = pd.DataFrame()
    f["symbol"] = df["symbol"]

    # Growth
    f["revenue_cagr"]     = pd.to_numeric(df.get("revenue_cagr_3y"),    errors="coerce")
    f["profit_cagr"]      = pd.to_numeric(df.get("profit_cagr_3y"),     errors="coerce")
    f["revenue_growth_1y"]= pd.to_numeric(df.get("revenue_growth_1y"),  errors="coerce")

    # Capital efficiency
    f["roce"]             = pd.to_numeric(df.get("roce"),               errors="coerce")
    f["roe"]              = pd.to_numeric(df.get("roe"),                errors="coerce")
    f["profit_margins"]   = pd.to_numeric(df.get("profit_margins"),     errors="coerce")
    f["opm"]              = pd.to_numeric(df.get("opm"),                errors="coerce")

    # Balance sheet
    f["debt_to_equity"]   = pd.to_numeric(df.get("debt_to_equity_yf"),  errors="coerce")
    f["current_ratio"]    = pd.to_numeric(df.get("current_ratio_yf"),   errors="coerce")

    # Valuation
    f["pe_ratio"]         = pd.to_numeric(df.get("stock_p_e"),          errors="coerce")
    f["price_to_book"]    = pd.to_numeric(df.get("book_value"),         errors="coerce")

    # Management
    f["promoter_holding"] = pd.to_numeric(df.get("promoter_holding"),   errors="coerce")

    # Derived binary features
    f["efficient"]        = (f["roce"]           > 15).astype(int)
    f["low_debt"]         = (f["debt_to_equity"] <  1).astype(int)
    f["strong_promoter"]  = (f["promoter_holding"]> 45).astype(int)
    f["high_growth"]      = (f["revenue_cagr"]   > 15).astype(int)
    f["profitable"]       = (f["profit_margins"]  >  0).astype(int)

    return f


if __name__ == "__main__":
    raw      = pd.read_csv("data/raw_financials.csv")
    features = build_features(raw)
    features.to_csv("data/features.csv", index=False)

    print("--- NaN counts ---")
    print(features.isnull().sum())
    print(f"\n--- Sample ---")
    print(features[["symbol","roce","revenue_cagr","profit_cagr",
                     "debt_to_equity","promoter_holding"]].to_string(index=False))