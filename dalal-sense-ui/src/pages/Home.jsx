import { useEffect, useState } from 'react'
import axios from 'axios'
import StockCard from '../components/StockCard'

const API = 'https://dalal-sense-1.onrender.com'

export default function Home() {
  const [stocks,  setStocks]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    axios.get(`${API}/scores`)
      .then(r => { setStocks(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = stocks
    .filter(s => filter === 'all' ||
      (filter === 'strong' && s.compounder_score >= 75) ||
      (filter === 'watch'  && s.compounder_score >= 50 && s.compounder_score < 75) ||
      (filter === 'weak'   && s.compounder_score < 50))
    .filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.compounder_score - a.compounder_score)

  const strong = stocks.filter(s => s.compounder_score >= 75).length
  const weak   = stocks.filter(s => s.compounder_score < 40).length

  return (
    <div style={{maxWidth:1100, margin:'0 auto', padding:'3rem 2rem'}}>

      <div style={{marginBottom:'3rem'}}>
        <h1 style={{fontSize:'2.5rem', fontWeight:600,
                    letterSpacing:'-0.5px', marginBottom:8}}>
          Compounder Screener
        </h1>
        <p style={{color:'#666', fontSize:'1.05rem'}}>
          Every score is backed by real NSE financials — not hype.
        </p>
      </div>

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

      <div style={{display:'flex', gap:8, marginBottom:'2rem', flexWrap:'wrap'}}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search symbol..."
          style={{flex:1, minWidth:180, padding:'8px 14px',
                  background:'#111', border:'1px solid #222',
                  borderRadius:999, color:'#fff', fontSize:13, outline:'none'}}/>
        {['all','strong','watch','weak'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{padding:'8px 16px', borderRadius:999, fontSize:12,
                    border: filter === f ? '1px solid #7F77DD' : '1px solid #222',
                    background: filter === f ? '#EEEDFE15' : 'transparent',
                    color: filter === f ? '#7F77DD' : '#666',
                    cursor:'pointer', fontWeight: filter === f ? 500 : 400,
                    textTransform:'capitalize'}}>
            {f === 'all' ? 'All stocks' : f === 'strong' ? 'Strong (75+)' :
             f === 'watch' ? 'Watch (50–75)' : 'Weak (<50)'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center', color:'#555', padding:'4rem'}}>
          Loading scores...
        </div>
      ) : (
        <div style={{display:'grid',
                     gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
                     gap:16}}>
          {filtered.map(s => <StockCard key={s.symbol} stock={s}/>)}
        </div>
      )}

      <div style={{marginTop:'3rem', paddingTop:'2rem', borderTop:'1px solid #1a1a1a',
                   display:'flex', justifyContent:'space-between', alignItems:'center',
                   flexWrap:'wrap', gap:12}}>
        <div style={{fontSize:12, color:'#333'}}>
          Data sourced from Screener.in and NSE via yfinance · Not investment advice
        </div>
        <div style={{fontSize:12, color:'#444', display:'flex', alignItems:'center', gap:8}}>
          <span>Built by</span>
          <a href="https://github.com/Aishwaryaaaaaaaa"
             target="_blank" rel="noreferrer"
             style={{color:'#7F77DD', textDecoration:'none', fontWeight:500}}>
            Aishwarya Jha
          </a>
          <span style={{color:'#2a2a2a'}}>·</span>
          <span>Class 11 · Pune</span>
          <span style={{color:'#2a2a2a'}}>·</span>
          <a href="https://github.com/Aishwaryaaaaaaaa/dalal-sense"
             target="_blank" rel="noreferrer"
             style={{color:'#555', textDecoration:'none'}}>
            View source ↗
          </a>
        </div>
      </div>

    </div>
  )
}