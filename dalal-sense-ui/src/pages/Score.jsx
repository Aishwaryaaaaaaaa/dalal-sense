import { useState } from 'react'
import axios from 'axios'
import ScoreRing from '../components/ScoreRing'
import FactorBar from '../components/FactorBar'

const API = 'http://localhost:8000'

const fields = [
  { key:'roce',             label:'ROCE (%)',             hint:'Return on Capital Employed', default:20 },
  { key:'roe',              label:'ROE (%)',               hint:'Return on Equity',           default:15 },
  { key:'revenue_cagr',     label:'Revenue CAGR 3Y (%)',  hint:'Compounded Sales Growth',    default:15 },
  { key:'profit_cagr',      label:'Profit CAGR 3Y (%)',   hint:'Compounded Profit Growth',   default:15 },
  { key:'debt_to_equity',   label:'Debt / Equity',        hint:'Lower is better',            default:0.5},
  { key:'promoter_holding', label:'Promoter Holding (%)', hint:'Higher = more conviction',   default:55 },
  { key:'pe_ratio',         label:'Stock P/E',            hint:'Price to Earnings',          default:30 },
]

export default function Score() {
  const [form,    setForm]    = useState(Object.fromEntries(fields.map(f => [f.key, f.default])))
  const [symbol,  setSymbol]  = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const submit = async () => {
    if (!symbol) { setError('Enter a stock symbol'); return }
    setLoading(true); setError('')
    try {
      const r = await axios.post(`${API}/score`, { symbol, ...form })
      setResult(r.data)
    } catch {
      setError('Could not connect to API. Make sure the backend is running.')
    }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:'3rem 2rem'}}>
      <h1 style={{fontSize:'2rem', fontWeight:600, marginBottom:8}}>Score a stock</h1>
      <p style={{color:'#666', marginBottom:'2rem'}}>
        Get numbers from{' '}
        <a href="https://screener.in" target="_blank" rel="noreferrer"
           style={{color:'#7F77DD'}}>screener.in/company/SYMBOL</a>
      </p>

      <div style={{background:'#111', border:'1px solid #1e1e1e',
                   borderRadius:16, padding:'1.5rem', marginBottom:'2rem'}}>
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{fontSize:12, color:'#666', display:'block', marginBottom:6}}>
            NSE SYMBOL
          </label>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. KAYNES, DIXON, INFY"
            style={{width:'100%', padding:'10px 14px', background:'#161616',
                    border:'1px solid #222', borderRadius:10, color:'#fff',
                    fontSize:15, outline:'none', fontWeight:500}}/>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{fontSize:12, color:'#666', display:'block', marginBottom:6}}>
                {f.label}
                <span style={{color:'#444', marginLeft:6}}>{f.hint}</span>
              </label>
              <input type="number" step="0.1"
                value={form[f.key]}
                onChange={e => setForm(prev => ({...prev, [f.key]: parseFloat(e.target.value) || 0}))}
                style={{width:'100%', padding:'9px 12px', background:'#161616',
                        border:'1px solid #222', borderRadius:10, color:'#fff',
                        fontSize:14, outline:'none'}}/>
            </div>
          ))}
        </div>

        {error && <div style={{color:'#E24B4A', fontSize:13, marginTop:12}}>{error}</div>}

        <button onClick={submit} disabled={loading}
          style={{marginTop:'1.5rem', width:'100%', padding:'12px',
                  background: loading ? '#222' : '#26215C',
                  color: loading ? '#555' : '#EEEDFE',
                  border:'none', borderRadius:12, fontSize:15,
                  fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer',
                  transition:'all 0.2s'}}>
          {loading ? 'Analysing...' : 'Generate Compounder Score →'}
        </button>
      </div>

      {result && (
        <div style={{background:'#111', border:'1px solid #1e1e1e',
                     borderRadius:16, padding:'1.5rem'}}>
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'2rem',
                       alignItems:'start'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
              <ScoreRing score={Math.round(result.compounder_score)} size={140}/>
              <div style={{textAlign:'center'}}>
                <div style={{fontWeight:600, fontSize:18}}>{result.symbol}</div>
                <div style={{fontSize:12, color:'#555', marginTop:2}}>{result.label}</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:13, color:'#888', lineHeight:1.7,
                           padding:'12px 16px', background:'#161616',
                           borderRadius:10, borderLeft:'2px solid #7F77DD',
                           marginBottom:'1.5rem'}}>
                {result.verdict}
              </div>
              <div style={{fontSize:12, color:'#555', marginBottom:10,
                           textTransform:'uppercase', letterSpacing:'0.06em'}}>
                What's driving this score
              </div>
              {result.factors.map(f => <FactorBar key={f.name} factor={f}/>)}
            </div>
          </div>
          <div style={{marginTop:'1.5rem', fontSize:11, color:'#333',
                       borderTop:'1px solid #1a1a1a', paddingTop:12}}>
            Not investment advice. Always do your own research before investing.
          </div>
        </div>
      )}
    </div>
  )
}