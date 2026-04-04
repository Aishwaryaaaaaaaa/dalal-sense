import streamlit as st
import pandas as pd
import joblib
import numpy as np
import sys
sys.path.insert(0, 'src')

st.set_page_config(page_title="Dalal Sense", page_icon="📈", layout="wide")

FEATURE_COLS = [
    "roce", "roe", "revenue_cagr", "profit_cagr",
    "debt_to_equity", "promoter_holding", "pe_ratio"
]

@st.cache_resource
def load_model():
    return joblib.load("data/model.pkl")

@st.cache_data
def load_scores():
    return pd.read_csv("data/scores.csv")

def score_color(score):
    if score >= 75: return "#1D9E75"
    if score >= 50: return "#BA7517"
    return "#E24B4A"

def score_label(score):
    if score >= 75: return "Strong compounder"
    if score >= 50: return "Watch closely"
    return "Weak fundamentals"

def cap_label(mktcap):
    if mktcap >= 20000: return "Large cap"
    if mktcap >= 5000:  return "Mid cap"
    return "Small cap"

# ── Header ──────────────────────────────────────────────
st.markdown("## 📈 Dalal Sense")
st.markdown("Compounder Score for every NSE stock — backed by real financials.")
st.divider()

# ── Tabs ────────────────────────────────────────────────
tab1, tab2 = st.tabs(["Screener", "Score a stock"])

# ── Tab 1: Screener ─────────────────────────────────────
with tab1:
    scores = load_scores()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Stocks scored", len(scores))
    col2.metric("Avg score",     f"{scores['compounder_score'].mean():.1f}")
    col3.metric("Score > 75",    len(scores[scores["compounder_score"] >= 75]))
    col4.metric("Score < 40",    len(scores[scores["compounder_score"] <  40]))

    st.divider()

    # Filters
    min_score = st.slider("Minimum score", 0, 100, 0, step=5)
    filtered  = scores[scores["compounder_score"] >= min_score].copy()
    filtered   = filtered.sort_values("compounder_score", ascending=False)

    # Table
    st.dataframe(
        filtered[["symbol", "compounder_score", "roce",
                  "revenue_cagr", "promoter_holding"]].style.format({
            "compounder_score": "{:.1f}",
            "roce":             "{:.1f}",
            "revenue_cagr":     "{:.1f}",
            "promoter_holding": "{:.1f}",
        }).background_gradient(subset=["compounder_score"],
                               cmap="RdYlGn", vmin=0, vmax=100),
        use_container_width=True, hide_index=True
    )

# ── Tab 2: Score a stock ─────────────────────────────────
with tab2:
    st.markdown("#### Enter stock financials from Screener.in")
    st.caption("Open screener.in/company/SYMBOL and fill in the numbers below.")

    col1, col2 = st.columns(2)
    with col1:
        symbol    = st.text_input("Stock symbol (NSE)", placeholder="e.g. KAYNES")
        roce      = st.number_input("ROCE (%)",              value=20.0, step=0.1)
        roe       = st.number_input("ROE (%)",               value=15.0, step=0.1)
        revenue_cagr = st.number_input("Revenue CAGR 3Y (%)", value=15.0, step=0.1)
    with col2:
        profit_cagr  = st.number_input("Profit CAGR 3Y (%)",  value=15.0, step=0.1)
        debt_to_eq   = st.number_input("Debt / Equity",        value=0.5,  step=0.1)
        promoter     = st.number_input("Promoter holding (%)", value=55.0, step=0.1)
        pe           = st.number_input("Stock P/E",            value=30.0, step=0.1)

    if st.button("Generate Compounder Score", type="primary"):
        model  = load_model()
        inputs = np.array([[roce, roe, revenue_cagr, profit_cagr,
                            debt_to_eq, promoter, pe]])
        prob   = model.predict_proba(inputs)[0][1]
        score  = round(prob * 100, 1)
        color  = score_color(score)
        label  = score_label(score)

        st.divider()
        col1, col2 = st.columns([1, 2])
        with col1:
            st.markdown(f"""
            <div style='text-align:center; padding:2rem;
                        border: 2px solid {color};
                        border-radius:16px;'>
                <div style='font-size:56px; font-weight:600;
                            color:{color};'>{score}</div>
                <div style='font-size:14px; color:gray;'>
                    compounder score</div>
                <div style='margin-top:8px; font-size:14px;
                            font-weight:500; color:{color};'>
                    {label}</div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            st.markdown("#### What's driving this score")
            factors = [
                ("ROCE",             roce,         15,  True,  "Capital efficiency"),
                ("Revenue CAGR",     revenue_cagr, 15,  True,  "Growth momentum"),
                ("Promoter holding", promoter,     45,  True,  "Management conviction"),
                ("Debt / Equity",    debt_to_eq,   1.0, False, "Balance sheet safety"),
                ("ROE",              roe,           15,  True,  "Return quality"),
            ]
            for name, val, threshold, higher_better, desc in factors:
                if higher_better:
                    good = val >= threshold
                else:
                    good = val <= threshold
                icon  = "✅" if good else "⚠️"
                color2= "#1D9E75" if good else "#E24B4A"
                st.markdown(
                    f"{icon} **{name}**: {val:.1f} — "
                    f"<span style='color:{color2}'>{desc}</span>",
                    unsafe_allow_html=True
                )

        st.divider()
        st.caption("Not investment advice. Always do your own research.")