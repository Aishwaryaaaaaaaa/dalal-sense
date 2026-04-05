import streamlit as st
import pandas as pd
import joblib
import numpy as np

st.set_page_config(
    page_title="Dalal Sense",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    .main { padding: 2rem 3rem; }
    .block-container { padding-top: 2rem; max-width: 1100px; }
    
    .hero-title {
        font-size: 2.8rem;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 0.3rem;
        letter-spacing: -0.5px;
    }
    .hero-sub {
        font-size: 1.05rem;
        color: #888;
        margin-bottom: 2rem;
    }
    .score-ring {
        text-align: center;
        padding: 2rem;
        border-radius: 16px;
        border: 2px solid;
    }
    .score-number {
        font-size: 4rem;
        font-weight: 600;
        line-height: 1;
    }
    .score-label {
        font-size: 0.85rem;
        color: #888;
        margin-top: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    .verdict-label {
        font-size: 1rem;
        font-weight: 500;
        margin-top: 0.8rem;
    }
    .metric-card {
        background: #1a1a1a;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        border: 1px solid #2a2a2a;
    }
    .factor-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #1e1e1e;
        font-size: 0.9rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        border-bottom: 1px solid #2a2a2a;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 20px;
        border-radius: 8px 8px 0 0;
        font-size: 0.9rem;
    }
    div[data-testid="metric-container"] {
        background: #141414;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        padding: 1rem;
    }
    .stDataFrame { border-radius: 12px; overflow: hidden; }
    .disclaimer {
        font-size: 0.75rem;
        color: #555;
        margin-top: 1rem;
    }
    .tag {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-right: 4px;
    }
</style>
""", unsafe_allow_html=True)

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
    if score >= 50: return "#E6A817"
    return "#E24B4A"

def score_label(score):
    if score >= 75: return "Strong compounder"
    if score >= 50: return "Watch closely"
    return "Weak fundamentals"

def score_emoji(score):
    if score >= 75: return "🟢"
    if score >= 50: return "🟡"
    return "🔴"

# ── Hero ─────────────────────────────────────────────────
st.markdown('<div class="hero-title">📈 Dalal Sense</div>', unsafe_allow_html=True)
st.markdown('<div class="hero-sub">Compounder Score for every NSE stock — built on real financials, not hype.</div>', unsafe_allow_html=True)

# ── Tabs ─────────────────────────────────────────────────
tab1, tab2 = st.tabs(["Screener", "Score a stock"])

# ── Tab 1: Screener ──────────────────────────────────────
with tab1:
    scores = load_scores()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Stocks scored",  len(scores))
    col2.metric("Avg score",      f"{scores['compounder_score'].mean():.1f}")
    col3.metric("Score above 75", len(scores[scores["compounder_score"] >= 75]))
    col4.metric("Score below 40", len(scores[scores["compounder_score"] <  40]))

    st.divider()

    col_a, col_b = st.columns([3, 1])
    with col_a:
        min_score = st.slider("Minimum score", 0, 100, 0, step=5)
    with col_b:
        sort_by = st.selectbox("Sort by", ["compounder_score", "roce", "revenue_cagr", "promoter_holding"])

    filtered = scores[scores["compounder_score"] >= min_score].copy()
    filtered = filtered.sort_values(sort_by, ascending=False)

    # Add emoji column
    filtered["signal"] = filtered["compounder_score"].apply(score_emoji)

    display_cols = ["signal", "symbol", "compounder_score", "roce", "revenue_cagr", "promoter_holding"]
    available   = [c for c in display_cols if c in filtered.columns]

    st.dataframe(
        filtered[available].style.format({
            "compounder_score": "{:.1f}",
            "roce":             "{:.1f}",
            "revenue_cagr":     "{:.1f}",
            "promoter_holding": "{:.1f}",
        }).background_gradient(
            subset=["compounder_score"], cmap="RdYlGn", vmin=0, vmax=100
        ),
        use_container_width=True,
        hide_index=True,
        height=400
    )

    st.markdown('<p class="disclaimer">Data sourced from Screener.in and NSE via yfinance. Not investment advice.</p>', unsafe_allow_html=True)

# ── Tab 2: Score a stock ──────────────────────────────────
with tab2:
    st.markdown("#### Score any NSE stock")
    st.caption("Get the numbers from screener.in/company/SYMBOL — takes 2 minutes.")

    col1, col2 = st.columns(2)
    with col1:
        symbol       = st.text_input("NSE Symbol", placeholder="e.g. KAYNES, DIXON, INFY")
        roce         = st.number_input("ROCE (%)",               value=20.0, step=0.1, help="Return on Capital Employed — higher is better")
        roe          = st.number_input("ROE (%)",                value=15.0, step=0.1, help="Return on Equity")
        revenue_cagr = st.number_input("Revenue CAGR 3Y (%)",   value=15.0, step=0.1, help="Compounded Sales Growth — 3 Years row on Screener")
    with col2:
        profit_cagr  = st.number_input("Profit CAGR 3Y (%)",    value=15.0, step=0.1, help="Compounded Profit Growth — 3 Years")
        debt_to_eq   = st.number_input("Debt / Equity",          value=0.5,  step=0.1, help="Lower is better. 0 = debt free")
        promoter     = st.number_input("Promoter Holding (%)",   value=55.0, step=0.1, help="Higher = more skin in the game")
        pe           = st.number_input("Stock P/E",              value=30.0, step=0.1, help="Price to Earnings ratio")

    st.divider()

    if st.button("Generate Compounder Score →", type="primary", use_container_width=True):
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
            <div style='text-align:center; padding:2.5rem 1.5rem;
                        border:2px solid {color}; border-radius:20px;
                        background: #0f0f0f;'>
                <div style='font-size:5rem; font-weight:600;
                            color:{color}; line-height:1;'>{score}</div>
                <div style='font-size:0.8rem; color:#666; margin-top:0.5rem;
                            text-transform:uppercase; letter-spacing:0.1em;'>
                    compounder score</div>
                <div style='margin-top:1rem; font-size:1rem;
                            font-weight:500; color:{color};'>{label}</div>
                {'<div style="margin-top:0.5rem;font-size:0.85rem;color:#666;">' + symbol.upper() + '</div>' if symbol else ''}
            </div>
            """, unsafe_allow_html=True)

        with col2:
            st.markdown("#### What's driving this score")
            st.caption("Each factor shows whether it's helping or hurting the score.")

            factors = [
                ("ROCE",             roce,         15,   True,  "Capital efficiency — core compounder signal"),
                ("Revenue CAGR",     revenue_cagr, 15,   True,  "Growth momentum"),
                ("Promoter holding", promoter,     45,   True,  "Management conviction"),
                ("Debt / Equity",    debt_to_eq,   1.0,  False, "Balance sheet safety"),
                ("ROE",              roe,           15,   True,  "Return quality"),
                ("P/E ratio",        pe,            60,   False, "Valuation — lower = cheaper"),
            ]

            for name, val, threshold, higher_better, desc in factors:
                good   = val >= threshold if higher_better else val <= threshold
                icon   = "✅" if good else "⚠️"
                color2 = "#1D9E75" if good else "#E24B4A"
                bar_w  = min(100, abs(val / threshold * 50)) if threshold != 0 else 50

                st.markdown(f"""
                <div style='display:flex; align-items:center; gap:12px;
                            padding:10px 0; border-bottom:1px solid #1e1e1e;'>
                    <span style='font-size:1.1rem;'>{icon}</span>
                    <div style='flex:1;'>
                        <div style='font-size:0.88rem; font-weight:500;
                                    color:#ddd;'>{name}: <span style='color:{color2}'>{val:.1f}</span></div>
                        <div style='font-size:0.78rem; color:#666;
                                    margin-top:2px;'>{desc}</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

        st.divider()
        st.caption("Not investment advice. Always do your own research before investing.")