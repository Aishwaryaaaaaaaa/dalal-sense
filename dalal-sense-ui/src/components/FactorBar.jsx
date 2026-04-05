export default function FactorBar({ factor }) {
  const { name, value, threshold, higher_better } = factor
  const good   = higher_better ? value >= threshold : value <= threshold
  const color  = good ? '#1D9E75' : '#E24B4A'
  const bgCol  = good ? '#E1F5EE' : '#FCEBEB'
  const pct    = Math.min(100, Math.abs((value / (threshold || 1)) * 60))

  return (
    <div style={{padding:'10px 0', borderBottom:'1px solid #1a1a1a'}}>
      <div style={{display:'flex', justifyContent:'space-between',
                   alignItems:'center', marginBottom:6}}>
        <span style={{fontSize:13, color:'#ccc'}}>{name}</span>
        <span style={{fontSize:13, fontWeight:500, color,
                      background: bgCol + '22', padding:'2px 10px',
                      borderRadius:999}}>
          {good ? '+' : '−'} {Math.abs(value).toFixed(1)}
        </span>
      </div>
      <div style={{height:3, background:'#1e1e1e', borderRadius:999}}>
        <div style={{height:3, width:`${pct}%`, background:color,
                     borderRadius:999, transition:'width 0.6s ease'}}/>
      </div>
    </div>
  )
}