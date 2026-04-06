# 📊 DalalSense  
### Finding India’s Next Compounders using Data & Machine Learning
## 🌐 Live Demo

👉 https://dalalsense.netlify.app

Try the screener and scoring system in real time.

DalalSense is a data-driven stock analysis project that explores a simple idea:

> *Do great companies look similar before they become great?*

The goal is to identify whether high-performing stocks (“compounders”) share measurable financial patterns early on and use those patterns to evaluate current NSE-listed companies.

---

## 🧠 The Idea

Many successful Indian companies (like Bajaj Finance, Dixon, etc.) showed strong fundamentals *before* their stock prices reflected it.

DalalSense attempts to:
- learn these patterns from historical data  
- apply them to current stocks  
- generate a **compounder score** based on financial strength  

This is not a prediction tool, but an **exploratory system to identify long-term quality signals**.

---

## ⚙️ How It Works

### 1. Feature Engineering

Raw financial data is transformed into structured features across 4 pillars:

- **Growth**
  - Revenue CAGR (3Y)
  - Profit CAGR (3Y)
  - Revenue growth (1Y)

- **Capital Efficiency**
  - ROCE
  - ROE
  - Operating margins

- **Balance Sheet Strength**
  - Debt-to-equity ratio
  - Current ratio

- **Management Quality**
  - Promoter holding

Additional derived signals:
- High growth, low debt, efficient capital use (binary features)
- Valuation filters (PE-based penalties, valuation score)

---

### 2. Machine Learning Model

A **Random Forest classifier** is trained on financial data from a curated set of stocks.

- Learns patterns from historically strong-performing companies  
- Uses features like growth, efficiency, and risk metrics  
- Outputs a **probability score** (converted to 0–100)

👉 Interpretation:
- Higher score = stronger similarity to historical compounders  

---

### 3. Scoring System

Each stock receives:
- **Compounder Score (0–100)**
- Label:
  - `Strong compounder`
  - `Watch closely`
  - `Weak fundamentals`

The model also returns **factor-level explanations**:
- ROCE vs threshold  
- Growth vs benchmark  
- Debt levels  
- Valuation context  

---
## ⚙️ Backend

Powered by a FastAPI backend that serves model predictions.
