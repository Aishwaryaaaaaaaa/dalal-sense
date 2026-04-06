import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = 'https://dalal-sense-1.onrender.com'

export default function Landing() {
  const [topStocks, setTopStocks] = useState([])
  const [count,     setCount]     = useState(0)

  useEffect(() => {
    axios.get(`${API}/scores`).then(r => {
      const sorted = r.data.sort((a,b) => b.compounder_score - a.compounder_score)
      setTopStocks(sorted.slice(0, 3))
      setCount(r.data.length)
    })
  }, [])

  const color = s => s >= 75 ? '#1D9E75' : s >= 50 ? '#BA7517' : '#E24B4A'

  return (
    <div>

      {/* Hero */}
      <div style={{maxWidth:900, margin:'0 auto', padding:'6rem 2rem 4rem',
                   textAlign:'center'}}>
        <div style={{display:'inline-block', fontSize:12, padding:'4px 14px',
                     borderRadius:999, border:'1px solid #7F77DD44',
                     color:'#7F77DD', marginBottom:'1.5rem',
                     background:'#7F77DD11'}}>
          Built for Indian markets · NSE stocks only
        </div>
        <h1 style={{fontSize:'clamp(2.2rem, 5vw, 3.8rem)', fontWeight:600,
                    letterSpacing:'-1px', lineHeight:1.15, marginBottom:'1.5rem'}}>
          Find tomorrow's large caps{' '}
          <span style={{color:'#7F77DD'}}>before</span>{' '}
          they become obvious
        </h1>
        <p style={{fontSize:'1.15rem', color:'#666', maxWidth:560,
                   margin:'0 auto 2.5rem', lineHeight:1.7}}>
          Dalal Sense scores every NSE stock on its compounder potential —
          backed by real financials, not hype. Built on the same DNA as
          Bajaj Finance in 2012 and Dixon in 2017.
        </p>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <Link to="/screener" style={{
            padding:'12px 28px', background:'#7F77DD', color:'#fff',
            borderRadius:12, textDecoration:'none', fontWeight:500,
            fontSize:15, transition:'all 0.2s'
          }}>
            View screener →
          </Link>
          <Link to="/score" style={{
            padding:'12px 28px', background:'transparent',
            color:'#888', border:'1px solid #222',
            borderRadius:12, textDecoration:'none', fontSize:15
          }}>
            Score a stock
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{borderTop:'1px solid #1a1a1a', borderBottom:'1px solid #1a1a1a',
                   padding:'1.5rem 2rem'}}>
        <div style={{maxWidth:900, margin:'0 auto', display:'grid',
                     gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',
                     gap:24, textAlign:'center'}}>
          {[
            ['NSE stocks scored', count || '29+'],
            ['Model accuracy',    '91%'],
            ['Training data',     '34 compounders'],
            ['Data source',       'Screener.in + NSE'],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{fontSize:22, fontWeight:600, color:'#fff',
                           marginBottom:4}}>{val}</div>
              <div style={{fontSize:12, color:'#555'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{maxWidth:900, margin:'0 auto', padding:'5rem 2rem'}}>
        <div style={{textAlign:'center', marginBottom:'3rem'}}>
          <h2 style={{fontSize:'1.8rem', fontWeight:600, marginBottom:8}}>
            How it works
          </h2>
          <p style={{color:'#555', fontSize:'1rem'}}>
            Three pillars. One score. No black boxes.
          </p>
        </div>
        <div style={{display:'grid',
                     gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
                     gap:16}}>
          {[
            {
              num:'01',
              title:'Growth quality',
              desc:'Revenue and profit CAGR over 3 years. We want companies growing faster than their sector — consistently.',
              color:'#7F77DD',
              metrics:['Revenue CAGR', 'Profit CAGR', 'Operating margin']
            },
            {
              num:'02',
              title:'Capital efficiency',
              desc:'ROCE above 15% means the business earns more than it costs to run. This is the single biggest predictor of long-term compounding.',
              color:'#1D9E75',
              metrics:['ROCE', 'ROE', 'Valuation score']
            },
            {
              num:'03',
              title:'Management quality',
              desc:'High promoter holding means founders have skin in the game. Low pledge means they\'re not under financial stress.',
              color:'#BA7517',
              metrics:['Promoter holding', 'Debt / Equity', 'PE ratio']
            },
          ].map(p => (
            <div key={p.num} style={{background:'#111', border:'1px solid #1e1e1e',
                                     borderRadius:16, padding:'1.5rem'}}>
              <div style={{fontSize:12, color:p.color, fontWeight:500,
                           marginBottom:12, letterSpacing:'0.06em'}}>{p.num}</div>
              <div style={{fontSize:16, fontWeight:500, marginBottom:8}}>{p.title}</div>
              <div style={{fontSize:13, color:'#666', lineHeight:1.7,
                           marginBottom:16}}>{p.desc}</div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {p.metrics.map(m => (
                  <div key={m} style={{fontSize:12, color:p.color,
                                       background:p.color+'11', padding:'4px 10px',
                                       borderRadius:6, display:'inline-block',
                                       width:'fit-content'}}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top picks preview */}
      {topStocks.length > 0 && (
        <div style={{background:'#0d0d0d', borderTop:'1px solid #1a1a1a',
                     borderBottom:'1px solid #1a1a1a', padding:'4rem 2rem'}}>
          <div style={{maxWidth:900, margin:'0 auto'}}>
            <div style={{display:'flex', justifyContent:'space-between',
                         alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:12}}>
              <div>
                <h2 style={{fontSize:'1.5rem', fontWeight:600, marginBottom:4}}>
                  Top compounder picks
                </h2>
                <p style={{color:'#555', fontSize:13}}>
                  Highest scoring stocks in the screener right now
                </p>
              </div>
              <Link to="/screener" style={{fontSize:13, color:'#7F77DD',
                                           textDecoration:'none'}}>
                View all {count} stocks →
              </Link>
            </div>
            <div style={{display:'grid',
                         gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
                         gap:12}}>
              {topStocks.map(s => (
                <div key={s.symbol}
                     style={{background:'#111', border:`1px solid ${color(s.compounder_score)}22`,
                             borderRadius:14, padding:'1.25rem'}}>
                  <div style={{display:'flex', justifyContent:'space-between',
                               alignItems:'center', marginBottom:12}}>
                    <div style={{fontWeight:600, fontSize:15}}>{s.symbol}</div>
                    <div style={{fontSize:22, fontWeight:600,
                                 color:color(s.compounder_score)}}>
                      {Math.round(s.compounder_score)}
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                    {[
                      ['ROCE', s.roce?.toFixed(1) + '%'],
                      ['Rev CAGR', s.revenue_cagr?.toFixed(1) + '%'],
                    ].map(([k,v]) => (
                      <div key={k} style={{background:'#161616',
                                           borderRadius:8, padding:'7px 10px'}}>
                        <div style={{fontSize:10, color:'#555', marginBottom:2}}>{k}</div>
                        <div style={{fontSize:13, fontWeight:500}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Why section */}
      <div style={{maxWidth:900, margin:'0 auto', padding:'5rem 2rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',
                     gap:32, alignItems:'center'}}>
          <div>
            <h2 style={{fontSize:'1.8rem', fontWeight:600,
                        marginBottom:'1rem', lineHeight:1.3}}>
              Why Dalal Sense?
            </h2>
            <p style={{color:'#666', lineHeight:1.8, marginBottom:'1rem'}}>
              Most retail investors look at isolated metrics — P/E here,
              revenue there. Dalal Sense combines them into one defensible
              score built on the financial DNA of India's greatest compounders.
            </p>
            <p style={{color:'#666', lineHeight:1.8}}>
              The model was trained on 34 historical NSE stocks that grew
              from small to large cap between 2010 and 2023 — reverse
              engineering what made them special before they became obvious.
            </p>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {[
              ['Not another screener', 'Most tools show data. Dalal Sense interprets it.'],
              ['Built on real compounders', 'Trained on Bajaj Finance, Dixon, Titan and 31 others.'],
              ['Explainable scores', 'Every score breaks down into what\'s driving it — no black boxes.'],
              ['India first', 'Built specifically for NSE. Not a US tool retrofitted for India.'],
            ].map(([title, desc]) => (
              <div key={title} style={{display:'flex', gap:12, alignItems:'flex-start'}}>
                <div style={{width:6, height:6, borderRadius:50, background:'#7F77DD',
                             marginTop:6, flexShrink:0}}/>
                <div>
                  <div style={{fontSize:13, fontWeight:500, marginBottom:2}}>{title}</div>
                  <div style={{fontSize:12, color:'#555', lineHeight:1.6}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{textAlign:'center', padding:'4rem 2rem',
                   borderTop:'1px solid #1a1a1a'}}>
        <h2 style={{fontSize:'1.8rem', fontWeight:600, marginBottom:12}}>
          Ready to find India's next compounder?
        </h2>
        <p style={{color:'#555', marginBottom:'2rem'}}>
          Free. No signup. Real NSE data.
        </p>
        <Link to="/screener" style={{
          padding:'14px 32px', background:'#7F77DD', color:'#fff',
          borderRadius:12, textDecoration:'none', fontWeight:500, fontSize:15
        }}>
          Open screener →
        </Link>
      </div>

      {/* Footer */}
      <div style={{borderTop:'1px solid #111', padding:'2rem',
                   display:'flex', justifyContent:'space-between',
                   alignItems:'center', flexWrap:'wrap', gap:12,
                   maxWidth:900, margin:'0 auto'}}>
        <div style={{fontSize:12, color:'#333'}}>
          Data from Screener.in + NSE · Not investment advice · Built with Python + React
        </div>
        <div style={{fontSize:12, color:'#444', display:'flex',
                     alignItems:'center', gap:8}}>
          <span>Built by</span>
          <a href="https://github.com/Aishwaryaaaaaaaa" target="_blank"
             rel="noreferrer"
             style={{color:'#7F77DD', textDecoration:'none', fontWeight:500}}>
            Aishwarya Jha
          </a>
          <span style={{color:'#222'}}>·</span>
          <span>17 · Pune</span>
          <span style={{color:'#222'}}>·</span>
          <a href="https://github.com/Aishwaryaaaaaaaa/dalal-sense"
             target="_blank" rel="noreferrer"
             style={{color:'#555', textDecoration:'none'}}>
            Source ↗
          </a>
        </div>
      </div>

    </div>
  )
}