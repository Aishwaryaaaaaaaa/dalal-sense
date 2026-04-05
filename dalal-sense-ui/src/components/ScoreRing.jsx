export default function ScoreRing({ score, size = 120 }) {
  const r     = (size / 2) - 8
  const circ  = 2 * Math.PI * r
  const fill  = ((score / 100) * circ)
  const gap   = circ - fill

  const color = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#E24B4A'
  const bg    = score >= 75 ? '#E1F5EE' : score >= 50 ? '#FAEEDA' : '#FCEBEB'

  return (
    <div style={{position:'relative', width:size, height:size,
                 display:'flex', flexDirection:'column',
                 alignItems:'center', justifyContent:'center'}}>
      <svg style={{position:'absolute', top:0, left:0}}
           width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r}
                fill="none" stroke={bg} strokeWidth="6" opacity="0.3"/>
        <circle cx={size/2} cy={size/2} r={r}
                fill="none" stroke={color} strokeWidth="6"
                strokeDasharray={`${fill} ${gap}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <span style={{fontSize: size * 0.28, fontWeight:600,
                    color, lineHeight:1}}>{score}</span>
      <span style={{fontSize:9, color:'#555', textTransform:'uppercase',
                    letterSpacing:'0.08em', marginTop:4}}>score</span>
    </div>
  )
}