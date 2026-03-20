// pages/index.jsx
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Head from 'next/head'

const fetcher = (url) => fetch(url).then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })

const T = {
  bg:'#0D1117',bg2:'#161B22',bg3:'#1C2430',card:'#1C2430',
  border:'#30363D',border2:'#444C56',ink:'#E6EDF3',ink2:'#8B949E',ink3:'#484F58',
  accent:'#238636',accentLight:'#2EA043',accentBg:'#0D2B12',
  blueBg:'#0C1F3D',orange:'#D29922',orangeBg:'#2D1E00',red:'#F85149',redBg:'#2D0F0F',
  mono:"'JetBrains Mono', monospace",serif:"'Instrument Serif', serif",sans:"'Space Grotesk', sans-serif",
}

const TRADE_COLORS = {
  'Roads & Highways':'#58A6FF','Buildings & Housing':'#BC8CFF','Water & Sanitation':'#3FB950',
  'Electrical Works':'#D29922','Bridges & Flyovers':'#FF7B72','Earthwork & Grading':'#79C0FF',
  'Structural Steel':'#FFA657','Other Works':'#8B949E',
}

function buildQueryString(filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v) })
  return params.toString() ? `?${params.toString()}` : ''
}

function AlertModal({ onClose, filters }) {
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('free')
  const [status, setStatus] = useState('idle')
  const submit = async () => {
    setStatus('loading')
    const res = await fetch('/api/alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, trade: filters.trade, state: filters.state, plan }) })
    setStatus(res.ok ? 'success' : 'error')
  }
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.bg2,border:`1px solid ${T.border}`,borderRadius:14,padding:'2rem',width:'90%',maxWidth:440,position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute',top:14,right:14,background:'none',border:'none',color:T.ink3,fontSize:18,cursor:'pointer' }}>✕</button>
        {status==='success' ? (
          <div style={{ textAlign:'center',padding:'1rem 0' }}>
            <div style={{ fontSize:40,color:T.accentLight,marginBottom:12 }}>✓</div>
            <h3 style={{ fontFamily:T.serif,fontStyle:'italic',fontSize:22,marginBottom:8,color:T.ink }}>You&apos;re all set!</h3>
            <p style={{ color:T.ink2,fontSize:13 }}>Daily alerts at 7 AM. Check your inbox.</p>
            <button onClick={onClose} style={{ width:'100%',padding:'12px',background:T.accent,color:'white',border:'none',borderRadius:6,fontFamily:T.mono,fontSize:13,cursor:'pointer',marginTop:8 }}>Done</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily:T.serif,fontStyle:'italic',fontSize:22,marginBottom:6,color:T.ink }}>Daily Tender Alerts</h3>
            <p style={{ color:T.ink2,fontSize:13,marginBottom:'1rem' }}>New tenders every morning at 7 AM.</p>
            <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{ width:'100%',padding:'10px 14px',border:`1px solid ${T.border}`,borderRadius:8,fontFamily:T.sans,fontSize:14,marginBottom:10,outline:'none',color:T.ink,background:T.bg3 }} />
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
              {[{key:'free',name:'Free',price:'₹0/mo',desc:'5 alerts/day'},{key:'pro',name:'Pro',price:'₹299/mo',desc:'Unlimited + WhatsApp'}].map(p=>(
                <div key={p.key} onClick={()=>setPlan(p.key)} style={{ border:`1px solid ${plan===p.key?T.accent:T.border}`,background:plan===p.key?T.accentBg:'transparent',borderRadius:8,padding:'10px 12px',cursor:'pointer' }}>
                  <div style={{ fontWeight:600,fontSize:13,color:T.ink }}>{p.name}</div>
                  <div style={{ fontFamily:T.mono,fontSize:12,color:T.accentLight }}>{p.price}</div>
                  <div style={{ fontSize:11,color:T.ink3,marginTop:4 }}>{p.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={submit} disabled={status==='loading'} style={{ width:'100%',padding:'12px',background:T.accent,color:'white',border:'none',borderRadius:6,fontFamily:T.mono,fontSize:13,cursor:'pointer',marginTop:8 }}>
              {status==='loading'?'Setting up...':'Start getting alerts →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function TenderCard({ t, saved, onSave }) {
  const color = TRADE_COLORS[t.trade]||'#8B949E'
  const uc = ({urgent:{text:'#F85149',bg:'#2D0F0F'},soon:{text:'#D29922',bg:'#2D1E00'},ok:{text:'#2EA043',bg:'#0D2B12'}})[t.urgency]||{text:'#2EA043',bg:'#0D2B12'}
  return (
    <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:'1.25rem',transition:'border-color 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=T.border2} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'0.75rem' }}>
        <div style={{ fontWeight:500,fontSize:14,lineHeight:1.4,flex:1,color:T.ink }}>{t.title}</div>
        <div style={{ fontFamily:T.mono,fontSize:15,fontWeight:500,color:T.accentLight,whiteSpace:'nowrap',flexShrink:0 }}>{t.valueLabel}</div>
      </div>
      <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:'0.75rem' }}>
        <Chip label={t.org} bg={T.blueBg} color='#58A6FF' border='#1F6FEB44' />
        <Chip label={t.trade} bg={`${color}22`} color={color} border={`${color}55`} />
        <Chip label={t.state} bg={T.bg3} color={T.ink2} border={T.border} />
        <Chip label={t.source} bg={T.bg} color={T.ink3} border={T.border} />
      </div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontFamily:T.mono,fontSize:11,color:T.ink3 }}>Closes:</span>
          <span style={{ fontFamily:T.mono,fontSize:12,fontWeight:500,color:uc.text }}>{new Date(t.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
          <span style={{ padding:'2px 8px',borderRadius:10,fontFamily:T.mono,fontSize:10,background:uc.bg,color:uc.text }}>{t.daysLeft}d left</span>
        </div>
        <div style={{ display:'flex',gap:6 }}>
          <button onClick={()=>onSave(t.id)} style={{ padding:'5px 10px',borderRadius:6,fontFamily:T.mono,fontSize:11,cursor:'pointer',border:`1px solid ${saved?T.orange:T.border}`,background:saved?T.orangeBg:'transparent',color:saved?T.orange:T.ink3,transition:'all 0.1s' }}>{saved?'★ Saved':'☆ Save'}</button>
          <a href={t.viewUrl} target="_blank" rel="noopener noreferrer" style={{ padding:'5px 14px',borderRadius:6,fontFamily:T.mono,fontSize:11,cursor:'pointer',border:`1px solid ${T.border}`,background:'transparent',color:T.ink2,textDecoration:'none',display:'inline-flex',alignItems:'center' }}>View →</a>
        </div>
      </div>
    </div>
  )
}

function Chip({ label, bg, color, border }) {
  return <span style={{ display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:12,fontFamily:"'JetBrains Mono',monospace",fontSize:11,background:bg,color,border:`1px solid ${border}` }}>{label}</span>
}

function Skeleton() {
  return (
    <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:'1.25rem' }}>
      {[100,70,50].map((w,i)=><div key={i} style={{ height:i===0?16:12,width:`${w}%`,background:T.bg3,borderRadius:4,marginBottom:10,animation:'pulse 1.5s ease-in-out infinite' }} />)}
    </div>
  )
}

function FilterSection({ label, children }) {
  return (
    <div style={{ marginBottom:'1.5rem' }}>
      <div style={{ fontFamily:T.mono,fontSize:10,textTransform:'uppercase',letterSpacing:1.5,color:T.ink3,marginBottom:8,padding:'0 4px' }}>{label}</div>
      <div style={{ display:'flex',flexDirection:'column',gap:2 }}>{children}</div>
    </div>
  )
}

function FilterItem({ label, count, active, onClick, color }) {
  return (
    <div onClick={onClick} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',borderRadius:6,cursor:'pointer',fontSize:13,color:active?T.ink:T.ink2,background:active?T.bg3:'transparent',border:`1px solid ${active?T.border:'transparent'}`,transition:'all 0.1s' }}>
      <span style={{ display:'flex',alignItems:'center',gap:6 }}>
        {color&&<span style={{ width:8,height:8,borderRadius:'50%',background:color,flexShrink:0 }} />}
        {label}
      </span>
      {count!==undefined&&<span style={{ fontFamily:T.mono,fontSize:10,padding:'1px 6px',borderRadius:8,background:active?T.accentBg:T.bg3,color:active?T.accentLight:T.ink3 }}>{count}</span>}
    </div>
  )
}

export default function TenderHub() {
  const [filters, setFilters] = useState({ trade:'all',state:'all',orgType:'all',sort:'deadline' })
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(new Set())
  const [showAlert, setShowAlert] = useState(false)
  const [searchDebounced, setSearchDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(()=>setSearchDebounced(search), 400)
    return ()=>clearTimeout(t)
  }, [search])

  const qs = buildQueryString({ ...filters, search: searchDebounced })
  const { data, error, isLoading } = useSWR(`/api/tenders${qs}`, fetcher, { revalidateOnFocus:false })
  const { data: filterOpts } = useSWR('/api/filters', fetcher)
  const setFilter = (key, val) => setFilters(f=>({...f,[key]:val}))
  const toggleSave = (id) => setSaved(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n })
  const stats = data?.stats

  return (
    <>
      <Head>
        <title>TenderHub India — Construction Tenders Aggregated</title>
        <meta name="description" content="All Indian construction tenders in one place." />
      </Head>

      <header style={{ background:T.bg2,borderBottom:`1px solid ${T.border}`,padding:'0 2rem',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100 }}>
        <div style={{ fontFamily:T.serif,fontSize:20,color:T.ink }}>
          Tender<span style={{ color:T.accentLight,fontStyle:'italic' }}>Hub</span> India
        </div>
        <div style={{ display:'flex',gap:'1.5rem',fontFamily:T.mono,fontSize:11,color:T.ink2,alignItems:'center' }}>
          {stats&&<><span><strong style={{ color:T.ink }}>{stats.total}</strong> active tenders</span><span><strong style={{ color:T.ink }}>₹{stats.totalValue.toLocaleString('en-IN')} Cr</strong> total value</span></>}
          <button onClick={()=>setShowAlert(true)} style={{ background:T.accent,color:'white',border:'none',padding:'7px 16px',borderRadius:6,fontFamily:T.mono,fontSize:12,cursor:'pointer' }}>Set up alerts →</button>
        </div>
      </header>

      <div style={{ display:'grid',gridTemplateColumns:'260px 1fr',minHeight:'calc(100vh - 56px)',background:T.bg }}>
        <aside style={{ background:T.bg2,borderRight:`1px solid ${T.border}`,padding:'1.5rem 1rem',position:'sticky',top:56,height:'calc(100vh - 56px)',overflowY:'auto' }}>
          <FilterSection label="Trade / Category">
            <FilterItem label="All trades" count={stats?.total} active={filters.trade==='all'} onClick={()=>setFilter('trade','all')} />
            {filterOpts?.trades?.map(tr=><FilterItem key={tr} label={tr} color={TRADE_COLORS[tr]} count={stats?.byTrade?.[tr]||0} active={filters.trade===tr} onClick={()=>setFilter('trade',tr)} />)}
          </FilterSection>
          <FilterSection label="State">
            <FilterItem label="All states" count={stats?.total} active={filters.state==='all'} onClick={()=>setFilter('state','all')} />
            {filterOpts?.states?.map(s=><FilterItem key={s} label={s} active={filters.state===s} onClick={()=>setFilter('state',s)} />)}
          </FilterSection>
          <FilterSection label="Organisation Type">
            <FilterItem label="All types" active={filters.orgType==='all'} onClick={()=>setFilter('orgType','all')} />
            {filterOpts?.orgTypes?.map(o=><FilterItem key={o} label={o} active={filters.orgType===o} onClick={()=>setFilter('orgType',o)} />)}
          </FilterSection>
          <FilterSection label="Sort">
            {[['deadline','By deadline'],['value-desc','Value ↓'],['value-asc','Value ↑'],['newest','Newest first']].map(([v,l])=>(
              <FilterItem key={v} label={l} active={filters.sort===v} onClick={()=>setFilter('sort',v)} />
            ))}
          </FilterSection>
        </aside>

        <main style={{ background:T.bg }}>
          <div style={{ background:T.bg2,borderBottom:`1px solid ${T.border}`,padding:'0.75rem 1.25rem',display:'flex',gap:'2rem',overflowX:'auto' }}>
            {stats&&Object.entries(stats.byTrade).slice(0,5).map(([trade,count])=>(
              <div key={trade} style={{ flexShrink:0 }}>
                <div style={{ fontFamily:T.mono,fontSize:16,fontWeight:500,color:TRADE_COLORS[trade]||T.ink }}>{count}</div>
                <div style={{ fontFamily:T.mono,fontSize:10,color:T.ink3,textTransform:'uppercase',letterSpacing:1 }}>{trade.split(' ')[0]}</div>
              </div>
            ))}
            {stats&&<div style={{ marginLeft:'auto',flexShrink:0 }}>
              <div style={{ fontFamily:T.mono,fontSize:16,fontWeight:500,color:T.red }}>{stats.closingThisWeek}</div>
              <div style={{ fontFamily:T.mono,fontSize:10,color:T.ink3,textTransform:'uppercase',letterSpacing:1 }}>Closing this week</div>
            </div>}
          </div>

          <div style={{ padding:'1rem 1.25rem 0.75rem',borderBottom:`1px solid ${T.border}`,display:'flex',gap:10 }}>
            <div style={{ flex:1,display:'flex',alignItems:'center',gap:8,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:'8px 12px' }}>
              <svg width="14" height="14" fill="none" stroke={T.ink3} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tenders, organisations, states..." style={{ border:'none',outline:'none',background:'transparent',fontFamily:T.sans,fontSize:14,color:T.ink,width:'100%' }} />
            </div>
          </div>

          <div style={{ padding:'0.75rem 1.25rem',borderBottom:`1px solid ${T.border}`,fontFamily:T.mono,fontSize:12,color:T.ink2 }}>
            <strong style={{ color:T.ink }}>{data?.tenders?.length??'—'}</strong> tenders found
          </div>

          <div style={{ padding:'1rem 1.25rem',display:'flex',flexDirection:'column',gap:10 }}>
            {isLoading?[1,2,3,4].map(i=><Skeleton key={i}/>)
              :error?<div style={{ textAlign:'center',padding:'3rem',color:T.red,fontFamily:T.mono,fontSize:13 }}>Failed to load tenders.</div>
              :!data?.tenders?.length?<div style={{ textAlign:'center',padding:'3rem',color:T.ink3,fontFamily:T.mono,fontSize:13 }}>No tenders match your filters.</div>
              :data.tenders.map(t=><TenderCard key={t.id} t={t} saved={saved.has(t.id)} onSave={toggleSave}/>)}
          </div>
        </main>
      </div>

      {showAlert&&<AlertModal onClose={()=>setShowAlert(false)} filters={filters}/>}

      <style jsx global>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:#0D1117!important;color:#E6EDF3;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input::placeholder{color:#484F58;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-track{background:#0D1117;}
        ::-webkit-scrollbar-thumb{background:#30363D;border-radius:3px;}
      `}</style>
    </>
  )
}