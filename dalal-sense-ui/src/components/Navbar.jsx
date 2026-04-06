import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  return (
    <nav style={{borderBottom:'1px solid #1e1e1e', background:'#0a0a0a'}}
         className="px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div style={{background:'#26215C', borderRadius:8, width:32, height:32,
                     display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12 L5 7 L8 9.5 L11 4 L14 6"
                  stroke="#CECBF6" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="11" cy="4" r="1.5" fill="#7F77DD"/>
          </svg>
        </div>
        <span style={{fontWeight:600, fontSize:16, color:'#fff'}}>Dalal Sense</span>
        <span style={{fontSize:11, color:'#555', marginLeft:2}}>compounder score</span>
      </Link>
      <div className="flex gap-2">
         {[['/', 'Home'], ['/screener', 'Screener'], ['/score', 'Score a stock']].map(([path, label]) => (
  <Link key={path} to={path}
    style={{
      fontSize:13, padding:'6px 14px', borderRadius:999,
      border: loc.pathname === path ? '1px solid #7F77DD' : '1px solid #222',
      background: loc.pathname === path ? '#EEEDFE15' : 'transparent',
      color: loc.pathname === path ? '#7F77DD' : '#888',
      textDecoration:'none', fontWeight: loc.pathname === path ? 500 : 400
    }}>
    {label}
  </Link>
))}
      </div>
    </nav>
  )
}