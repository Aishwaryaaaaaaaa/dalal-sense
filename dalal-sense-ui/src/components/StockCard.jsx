import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreRing from './ScoreRing'

export default function StockCard({ stock }) {
  const navigate  = useNavigate()
  const [tooltip, setTooltip] = useState(null)

  const score    = stock.compounder_score
  const color    = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#E24B4A'
  const label    = score >= 75 ? 'Strong compounder' : score >= 50 ? 'Watch closely' : 'Weak fundamentals'
  const momentum = score >= 75 ? 'Accelerating' : score >= 50 ? 'Stable' : 'Slowing'

  const metrics = [
    { key:'ROCE',     value: stock.roce?.toFixed(1) + '%',             threshold:15,  higher:true,  desc:'Return on Capital Employed. Above 15% signals efficient capital use — a core compounder trait.' },
    { key:'Rev CAGR', value: stock.revenue_cagr?.toFixed(1) + '%',     threshold:15,  higher:true,  desc:'Revenue growth over 3 years. Above 15% shows sustained business momentum.' },
    { key:'Promoter', value: stock.promoter_holding?.toFixed(1) + '%', threshold:45,  higher:true,  desc:'How much the founders own. Higher = more skin in the game.' },
    { key:'P/E',      value: stock.pe_ratio?.toFixed(1),               threshold:60,  higher:false, desc:'Price to Earnings. Lower is cheaper. Above 60 may mean the stock is expensive.' },
  ]

  return (
    <div onClick={() => navigate(`/score?prefill=${stock.symbol}`)}
         style={{background:'#111', border: score >= 75 ? '1px solid #7F77DD44' : '1px solid #1e1e1e',
                 borderRadius:16, padding:'1.25rem', cursor:'pointer', transition:'all 0.2s'}}
         onMouseEnter={e => e.currentTarget.style.borderColor = color + '66'}
         onMouseLeave={e => e.currentTarget.style.borderColor = score >= 75 ? '#7F77DD44' : '#1e1e1e'}>

      <div style={{display:'flex', justifyContent:'space-between',
                   alignItems:'flex-start', marginBottom:16}}>
        <div>
          <div style={{fontWeight:600, fontSize:15, marginBottom:4}}>{stock.symbol}</div>
          <div style={{fontSize:11, color:'#555', textTransform:'uppercase',
                       letterSpacing:'0.06em'}}>{momentum}</div>
        </div>
        <ScoreRing score={Math.round(score)} size={72}/>
      </div>

      <div style={{fontSize:11, padding:'4px 12px', borderRadius:999, display:'inline-block',
                   background: color + '18', color, fontWeight:500, marginBottom:12}}>
        {label}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, position:'relative'}}>
        {metrics.map(m => {
          const good   = m.higher ? parseFloat(m.value) >= m.threshold : parseFloat(m.value) <= m.threshold
          const mcolor = good ? '#1D9E75' : '#E24B4A'
          const isOpen = tooltip === m.key
          return (
            <div key={m.key}
                 onClick={e => { e.stopPropagation(); setTooltip(isOpen ? null : m.key) }}
                 style={{background:'#161616', borderRadius:8, padding:'8px 10px',
                         cursor:'pointer', position:'relative',
                         border: isOpen ? `1px solid ${mcolor}44` : '1px solid transparent',
                         transition:'all 0.15s'}}>
              <div style={{fontSize:10, color:'#555', marginBottom:2}}>{m.key}</div>
              <div style={{fontSize:13, fontWeight:500, color:mcolor}}>{m.value}</div>
              {isOpen && (
                <div onClick={e => e.stopPropagation()}
                     style={{position:'absolute', bottom:'calc(100% + 8px)', left:0,
                             background:'#1a1a1a', border:`1px solid ${mcolor}44`,
                             borderRadius:10, padding:'10px 12px', width:220,
                             fontSize:12, color:'#bbb', lineHeight:1.6,
                             zIndex:100, boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>
                  <div style={{fontWeight:500, color:mcolor, marginBottom:4}}>
                    {good ? '✅ Positive signal' : '⚠️ Watch this'}
                  </div>
                  {m.desc}
                  <div style={{marginTop:8, fontSize:11, color:'#555'}}>
                    Threshold: {m.higher ? '≥' : '≤'} {m.threshold}{m.key === 'P/E' ? '' : '%'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}