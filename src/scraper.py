import requests
from bs4 import BeautifulSoup
import yfinance as yf
import pandas as pd
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def clean_num(text):
    if not text:
        return None
    text = str(text).replace(",", "").replace("%", "").replace("₹", "").replace("Cr", "").strip()
    try:
        return float(text)
    except:
        return None

def scrape_screener(symbol):
    data = {"symbol": symbol}
    for url in [
        f"https://www.screener.in/company/{symbol}/consolidated/",
        f"https://www.screener.in/company/{symbol}/"
    ]:
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            if r.status_code == 200:
                break
        except:
            continue
    else:
        return data

    soup = BeautifulSoup(r.content, "html.parser")

    # Top ratios
    for li in soup.select("#top-ratios li"):
        name = li.select_one(".name")
        val  = li.select_one(".number")
        if name and val:
            key = name.text.strip().lower().replace(" ", "_").replace("/","_")
            data[key] = clean_num(val.text)

    # Promoter holding
    for section in soup.select("section"):
        h2 = section.find("h2")
        if h2 and "shareholding" in h2.text.lower():
            for row in section.select("table tr"):
                cells = row.select("td")
                if cells and "promoter" in cells[0].text.lower():
                    if len(cells) > 1:
                        data["promoter_holding"] = clean_num(cells[1].text)
                    break

    # Compounded sales/profit growth + debt/equity
    # These live inside #profit-loss and #balance-sheet sections
    for section in soup.select("section"):
        sid = section.get("id", "")

        if sid == "profit-loss":
            rows = section.select("table tr")
            for row in rows:
                cells = row.select("td, th")
                if not cells:
                    continue
                label = cells[0].text.strip().lower()
                # last td = most recent value
                vals  = [clean_num(c.text) for c in cells[1:] if clean_num(c.text) is not None]
                if not vals:
                    continue
                latest = vals[-1]
                if "compounded sales growth" in label or ("sales growth" in label and "compounded" in label):
                    # try to find 3y/5y sub-rows
                    pass
                if "opm" in label or "operating profit margin" in label:
                    data["opm"] = latest

        if sid == "balance-sheet":
            rows = section.select("table tr")
            for row in rows:
                cells = row.select("td, th")
                if not cells:
                    continue
                label = cells[0].text.strip().lower()
                vals  = [clean_num(c.text) for c in cells[1:] if clean_num(c.text) is not None]
                if not vals:
                    continue
                latest = vals[-1]
                if "borrowings" in label:
                    data["borrowings"] = latest
                if "total assets" in label:
                    data["total_assets"] = latest
                if "equity" in label and "share" in label:
                    data["equity"] = latest

    # Compute debt/equity from balance sheet if available
    if data.get("borrowings") and data.get("equity") and data["equity"] != 0:
        data["debt_to_equity"] = round(data["borrowings"] / data["equity"], 2)

    return data


def get_yfinance_growth(symbol):
    out = {}
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        info   = ticker.info
        out["revenue_growth_yf"] = info.get("revenueGrowth")
        out["earnings_growth_yf"] = info.get("earningsGrowth")
        out["current_ratio_yf"]  = info.get("currentRatio")
        out["debt_to_equity_yf"] = info.get("debtToEquity")
        out["profit_margins"]    = info.get("profitMargins")

        # 3Y revenue CAGR from financials
        fin = ticker.financials
        if fin is not None and not fin.empty and "Total Revenue" in fin.index:
            revs = fin.loc["Total Revenue"].dropna().sort_index()
            if len(revs) >= 3:
                cagr = ((revs.iloc[-1] / revs.iloc[-3]) ** (1/3) - 1) * 100
                out["revenue_cagr_3y"] = round(cagr, 1)
            if len(revs) >= 2:
                latest_growth = ((revs.iloc[-1] / revs.iloc[-2]) - 1) * 100
                out["revenue_growth_1y"] = round(latest_growth, 1)

        # 3Y profit CAGR
        if fin is not None and not fin.empty and "Net Income" in fin.index:
            profits = fin.loc["Net Income"].dropna().sort_index()
            if len(profits) >= 3:
                # only compute if both endpoints are positive
                if profits.iloc[-1] > 0 and profits.iloc[-3] > 0:
                    cagr = ((profits.iloc[-1] / profits.iloc[-3]) ** (1/3) - 1) * 100
                    out["profit_cagr_3y"] = round(cagr, 1)

    except Exception as e:
        print(f"  yfinance error for {symbol}: {e}")
    return out


def scrape_many(symbols, delay=3):
    results = []
    for i, sym in enumerate(symbols):
        print(f"[{i+1}/{len(symbols)}] {sym}...")
        d = scrape_screener(sym)
        yf_data = get_yfinance_growth(sym)
        d.update(yf_data)
        results.append(d)
        time.sleep(delay)

    df = pd.DataFrame(results)
    df.to_csv("data/raw_financials.csv", index=False)
    print(f"\nDone. Columns: {list(df.columns)}")
    return df


if __name__ == "__main__":
    symbols = [
        "BAJFINANCE", "DIXON", "TITAN", "ASTRAL", "POLYCAB",
        "TATAELXSI", "VARUNBEV", "DMART", "PERSISTENT", "COFORGE",
        "SUZLON", "RCOM", "YESBANK", "JPASSOCIAT", "UNITECH",
        "VIDEOCON", "DLFINDIA", "GMRINFRA", "IBULHSGFIN", "PTC",
        "KAYNES", "TDPOWERSYS", "EPIGRAL", "WAAREEENER", "ZOMATO",
        "RELIANCE", "INFY", "HDFCBANK", "ASIANPAINT", "BAJAJFINSV"
    ]
    scrape_many(symbols)