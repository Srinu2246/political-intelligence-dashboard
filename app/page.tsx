'use client'

import { useMemo, useState } from 'react'
import {
  AppBar, Box, Button, Card, CardContent, Chip, CssBaseline, Divider, Drawer,
  FormControl, IconButton, InputAdornment, InputLabel, LinearProgress, MenuItem,
  Paper, Select, SelectChangeEvent, Stack, Tab, Tabs, TextField, ThemeProvider,
  Toolbar, Tooltip, Typography, createTheme,
} from '@mui/material'
import {
  Activity, BarChart3, Bell, BookOpen, CircleHelp, Download,
  FileText, Filter, Gauge, LayoutDashboard, MapPin, Menu, Search, Settings,
  ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, Users, Vote, X,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { WorkspaceSwitcher } from '@/components/workspace-switcher'
import { constituencyProfile } from '@/lib/constituency-profile'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#234b53', dark: '#183c43', light: '#e8f0ec' },
    secondary: { main: '#c66a32', light: '#fff1e5' },
    success: { main: '#34704b', light: '#edf6ef' },
    background: { default: '#f4f6f2', paper: '#ffffff' },
    text: { primary: '#1b2524', secondary: '#65716e' },
    divider: '#e1e8e4',
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    h4: { fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.04em' },
    h5: { fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.025em' },
    h6: { fontSize: '1.125rem', fontWeight: 750, lineHeight: 1.35 },
    subtitle1: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.45 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 9 } } },
    MuiTab: { styleOverrides: { root: { minHeight: 44, fontWeight: 700, textTransform: 'none' } } },
  },
})

const elections = [
  { year: '2024', winner: 'Bandi Sanjay Kumar', party: 'BJP', votes: 585116, valid: 1154192, electors: 1717848, runner: 464847, turnout: 67.18 },
  { year: '2019', winner: 'Bandi Sanjay Kumar', party: 'BJP', votes: 498276, valid: 1115321, electors: 1653852, runner: 368751, turnout: 67.44 },
  { year: '2014', winner: 'Vinod Kumar Boianapalli', party: 'BRS', votes: 409888, valid: 1019903, electors: 1516279, runner: 365165, turnout: 67.27 },
  { year: '2009', winner: 'Ponnam Prabhakar', party: 'INC', votes: 354549, valid: 857317, electors: 1345809, runner: 312511, turnout: 63.70 },
]
const assemblies = [
  { name: 'Karimnagar', no: '26', winner: 'Bandi Sanjay Kumar', party: 'BJP', votes: 103251, share: 46.8, margin: 14396 },
  { name: 'Choppadandi', no: '27', winner: 'Medipalli Sathyam', party: 'INC', votes: 95618, share: 44.1, margin: 8125 },
  { name: 'Vemulawada', no: '28', winner: 'Aadi Srinivas', party: 'INC', votes: 88491, share: 42.7, margin: 5280 },
  { name: 'Manakondur', no: '29', winner: 'Kavvampalli Satyanarayana', party: 'INC', votes: 110204, share: 48.3, margin: 21741 },
  { name: 'Husnabad', no: '30', winner: 'Ponnam Prabhakar', party: 'INC', votes: 101829, share: 45.9, margin: 1872 },
  { name: 'Huzurabad', no: '31', winner: 'Eatala Rajender', party: 'BJP', votes: 106783, share: 49.2, margin: 16769 },
  { name: 'Karimnagar City', no: '32', winner: 'Gangula Kamalakar', party: 'BRS', votes: 92183, share: 43.5, margin: 3904 },
]
const assemblyPartyTotals = assemblies.reduce<Record<string, number>>((totals, assembly) => {
  totals[assembly.party] = (totals[assembly.party] ?? 0) + 1
  return totals
}, {})
const leadingAssemblyParty = Object.entries(assemblyPartyTotals).sort((a, b) => b[1] - a[1])[0]
const closestAssemblyContest = assemblies.reduce((closest, assembly) => (
  assembly.margin < closest.margin ? assembly : closest
), assemblies[0])
const partyColors: Record<string, { main: string; light: string }> = {
  BJP: { main: '#a94b0b', light: '#fff0e2' },
  INC: { main: '#1464a5', light: '#eaf4fc' },
  BRS: { main: '#a52b62', light: '#fcecf3' },
}
const winnerShareData = elections.slice().reverse().map(election => ({
  year: election.year,
  voteShare: Number(((election.votes / election.valid) * 100).toFixed(1)),
}))
const chartColors = { series: '#237a73', grid: '#e6ebe8', axis: '#65716e' }

function MetricCard({ icon: Icon, label, value, detail, accent = '#234b53' }: { icon: typeof Vote; label: string; value: string; detail: string; accent?: string }) {
  return (
    <Card className="metric-card" elevation={0} sx={{ '--metric-accent': accent } as React.CSSProperties}>
      <CardContent>
        <Box className="metric-icon" sx={{ color: accent, bgcolor: `${accent}12` }}><Icon size={18} /></Box>
        <Typography className="eyebrow">{label}</Typography>
        <Typography variant="h5" className="metric-value">{value}</Typography>
        <Typography variant="caption" color="text.secondary" className="metric-detail">{detail}</Typography>
      </CardContent>
    </Card>
  )
}
function ChartCard({ title, subtitle, children, action }: { title:string; subtitle:string; children:React.ReactNode; action?:React.ReactNode }) {
  return <Card elevation={0} className="panel"><CardContent><Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'flex-start', gap:2, mb:2 }}><Box><Typography variant="subtitle1" sx={{ fontWeight:800 }}>{title}</Typography><Typography variant="caption" color="text.secondary">{subtitle}</Typography></Box>{action}</Stack>{children}</CardContent></Card>
}

export default function Page() {
  const [drawer, setDrawer] = useState(false); const [year, setYear] = useState('2024'); const [assembly, setAssembly] = useState('All assemblies'); const [tab, setTab] = useState(0); const [query, setQuery] = useState('')
  const selected = elections.find(e => e.year === year) ?? elections[0]
  const selectedMargin = selected.votes - selected.runner
  const filteredAssemblies = useMemo(() => assemblies.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) && (assembly === 'All assemblies' || a.name === assembly)), [query, assembly])
  const changeYear = (e: SelectChangeEvent) => setYear(e.target.value)
  const navItems = [['Overview', LayoutDashboard], ['Parliamentary analysis', TrendingUp], ['Assembly explorer', MapPin], ['Trends & indicators', Activity], ['Sources & methodology', BookOpen]] as const
  return <ThemeProvider theme={theme}><CssBaseline /><Box className="app-shell"><AppBar position="fixed" elevation={0} className="topbar"><Toolbar><IconButton className="mobile-menu" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu size={21}/></IconButton><Box className="brand-mark"><span>POL</span><strong>INTEL</strong></Box><Typography className="topbar-title">Political intelligence workspace</Typography><Box sx={{ flex:1 }} /><Chip icon={<BookOpen size={14}/>} label="Sources listed" className="verified-chip" /><IconButton aria-label="Notifications"><Bell size={19}/></IconButton><Divider orientation="vertical" flexItem sx={{ mx: 1 }} /><Typography variant="caption" color="text.secondary" sx={{ display:{xs:'none',sm:'block'} }}>Analyst workspace</Typography><Box className="avatar">AR</Box></Toolbar></AppBar>
  <Drawer open={drawer} onClose={() => setDrawer(false)} className="mobile-drawer"><Sidebar navItems={navItems} tab={tab} setTab={setTab} close={() => setDrawer(false)} assemblySegmentCount={assemblies.length} /></Drawer><Box className="sidebar-desktop"><Sidebar navItems={navItems} tab={tab} setTab={setTab} assemblySegmentCount={assemblies.length} /></Box>
  <Box component="main" className="main-content"><Box className="page-header"><Box><Stack direction="row" spacing={1} sx={{ alignItems:'center', mb:1 }}><Chip label={constituencyProfile.lokSabha} size="small" className="soft-chip"/><Typography variant="caption" color="text.secondary">Last updated 12 Jun 2024</Typography></Stack><Typography variant="h4">{constituencyProfile.name}</Typography><Stack direction="row" sx={{ gap:1, alignItems:'center', mt:.5 }}><MapPin size={15} color="#65716e"/><Typography color="text.secondary">Parliamentary constituency {constituencyProfile.parliamentaryConstituency} · {constituencyProfile.state}</Typography><Typography color="text.secondary">·</Typography><Typography color="text.secondary">{assemblies.length} assembly segments</Typography></Stack></Box><Stack direction="row" spacing={1} sx={{ alignItems:'center' }}><Button variant="outlined" startIcon={<Download size={16}/>} className="outline-btn">Export report</Button><Button variant="contained" startIcon={<SlidersHorizontal size={16}/>} className="primary-btn">Compare</Button></Stack></Box>
  <Paper className="filter-bar" elevation={0}><Box className="filter-label"><Filter size={16}/><Typography variant="body2" sx={{ fontWeight:800 }}>Dashboard filters</Typography></Box><FormControl size="small" sx={{ minWidth: 140 }}><InputLabel>Election year</InputLabel><Select value={year} label="Election year" onChange={changeYear}>{elections.map(e => <MenuItem key={e.year} value={e.year}>{e.year} Lok Sabha</MenuItem>)}</Select></FormControl><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Assembly segment</InputLabel><Select value={assembly} label="Assembly segment" onChange={e => setAssembly(e.target.value)}><MenuItem value="All assemblies">All assemblies</MenuItem>{assemblies.map(a => <MenuItem key={a.no} value={a.name}>{a.no} · {a.name}</MenuItem>)}</Select></FormControl><Box sx={{ flex:1 }}/><Button size="small" onClick={() => {setYear('2024');setAssembly('All assemblies')}}>Reset filters</Button></Paper>
  <Tabs value={tab} onChange={(_,v) => setTab(v)} className="section-tabs" variant="scrollable" scrollButtons={false} aria-label="Dashboard sections"><Tab label="Overview"/><Tab label="Parliamentary analysis"/><Tab label="Assembly explorer"/><Tab label="Trends & indicators"/><Tab label="Sources"/></Tabs>
  <Box className={`dashboard-page dashboard-page-${tab}`}>
  {tab === 0 && (
    <>
      <Stack direction="row" sx={{ gap: 2 }} className="metrics-grid">
        <MetricCard
          icon={Vote}
          label={`Winning candidate · ${selected.year}`}
          value={selected.winner}
          detail={`${selected.party} · ${selected.votes.toLocaleString()} votes`}
          accent={partyColors[selected.party]?.main ?? theme.palette.primary.main}
        />
        <MetricCard
          icon={Users}
          label="Winning vote share"
          value={`${((selected.votes / selected.valid) * 100).toFixed(1)}%`}
          detail={`${selected.votes.toLocaleString()} of ${selected.valid.toLocaleString()} valid votes`}
        />
        <MetricCard
          icon={TrendingUp}
          label="Winning margin"
          value={selectedMargin.toLocaleString()}
          detail={`${((selectedMargin / selected.valid) * 100).toFixed(1)}% of valid votes`}
          accent="#237a73"
        />
        <MetricCard
          icon={Gauge}
          label="Voter turnout"
          value={`${selected.turnout}%`}
          detail={`${selected.electors.toLocaleString()} registered electors`}
          accent="#8a6548"
        />
      </Stack>
      <Box className="content-grid">
        <ChartCard
          title="Winning candidate vote share"
          subtitle="Candidate votes / valid votes · Lok Sabha elections"
          action={(
            <Tooltip title="Calculated from the winner's votes divided by valid votes for each election">
              <IconButton size="small" aria-label="Vote share calculation"><CircleHelp size={16} /></IconButton>
            </Tooltip>
          )}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={winnerShareData} margin={{ left: -16, right: 12, top: 8, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: chartColors.axis, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} unit="%" domain={[0, 'auto']} tick={{ fill: chartColors.axis, fontSize: 12 }} />
              <RechartsTooltip
                formatter={(value) => [`${value}%`, 'Winner vote share']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e1e8e4', boxShadow: '0 8px 24px rgba(27,37,36,.08)' }}
              />
              <Line type="monotone" dataKey="voteShare" name="Winning candidate" stroke={chartColors.series} strokeWidth={3} dot={{ r: 4, fill: chartColors.series, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
          <Typography variant="caption" color="text.secondary" className="chart-footnote">
            Calculated from the election vote totals shown in this dashboard.
          </Typography>
        </ChartCard>
        <ChartCard
          title="Constituency profile"
          subtitle={`Census of India · ${constituencyProfile.censusYear} reference data`}
        >
          <Box className="profile-layout">
            <ResponsiveContainer width="52%" height={205}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Urban', value: constituencyProfile.urbanPopulation },
                    { name: 'Rural', value: constituencyProfile.ruralPopulation },
                  ]}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                >
                  <Cell fill="#234b53" />
                  <Cell fill="#d9e1dc" />
                </Pie>
                <Legend iconType="circle" formatter={(value) => `${value} population`} />
              </PieChart>
            </ResponsiveContainer>
            <Stack spacing={1.4} sx={{ flex: 1 }}>
              <ProfileRow label="Population" value={constituencyProfile.population} />
              <ProfileRow label="Literacy rate" value={constituencyProfile.literacyRate} />
              <ProfileRow label="Gender ratio" value={constituencyProfile.genderRatio} />
              <ProfileRow label="SC / ST population" value={constituencyProfile.scStPopulation} />
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Source: Census of India {constituencyProfile.censusYear} - constituency-aligned estimates from district tables.
          </Typography>
        </ChartCard>
      </Box>
      <ChartCard
        title="Assembly constituency snapshot"
        subtitle="2023 Telangana Assembly results - select a segment to inspect"
        action={(
          <TextField
            size="small"
            placeholder="Search segments"
            value={query}
            onChange={event => setQuery(event.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
          />
        )}
      >
        <AssemblyTable rows={filteredAssemblies} />
      </ChartCard>
    </>
  )}
  {tab === 1 && <Box className="stack-section"><ChartCard title="Historical parliamentary analysis" subtitle="Candidate-wise results, vote share and winning margin"><Box className="history-highlight"><Box><Typography className="eyebrow">{selected.year} winner</Typography><Typography variant="h5">{selected.winner}</Typography><Chip label={selected.party} size="small" sx={{ bgcolor:partyColors[selected.party]?.light ?? '#eef1ef', color:partyColors[selected.party]?.main ?? '#52605c', mt:1, fontWeight:800 }}/></Box><Box><Typography className="eyebrow">Votes received</Typography><Typography variant="h5">{selected.votes.toLocaleString()}</Typography></Box><Box><Typography className="eyebrow">Valid votes</Typography><Typography variant="h5">{selected.valid.toLocaleString()}</Typography></Box><Box><Typography className="eyebrow">Runner-up</Typography>  <Typography variant="body1" sx={{ fontWeight:700 }}>{selected.runner.toLocaleString()} votes</Typography></Box></Box><Divider sx={{my:2}}/><ResponsiveContainer width="100%" height={280}><BarChart data={elections.map(e=>({year:e.year, margin:e.votes-e.runner}))} margin={{left:-20}}><CartesianGrid vertical={false} stroke={chartColors.grid}/><XAxis dataKey="year"/><YAxis/><RechartsTooltip/><Legend/><Bar dataKey="margin" name="Winning margin (votes)" fill={chartColors.series} radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Candidate results table" subtitle="Recorded parliamentary winners across the election series"><AssemblyTable nameLabel="Candidate" rows={elections.map(e=>({name:e.winner,no:e.party,winner:e.winner,party:e.party,votes:e.votes,share:+(e.votes/e.valid*100).toFixed(1),margin:e.votes-e.runner}))}/></ChartCard></Box>}
  {tab === 2 && (
    <Box className="stack-section">
      <ChartCard
        title="Assembly constituency explorer"
        subtitle="Filter by segment to compare winners, vote share and margin"
      >
        <Box className="assembly-kpis">
          <MetricCard
            icon={MapPin}
            label="Segments shown"
            value={`${filteredAssemblies.length} / ${assemblies.length}`}
            detail="within Karimnagar PC"
          />
          <MetricCard
            icon={Vote}
            label="Leading party"
            value={leadingAssemblyParty?.[0] ?? 'Data unavailable'}
            detail={`${leadingAssemblyParty?.[1] ?? 0} of ${assemblies.length} segments`}
            accent={partyColors[leadingAssemblyParty?.[0] ?? '']?.main ?? theme.palette.primary.main}
          />
          <MetricCard
            icon={TrendingUp}
            label="Closest contest"
            value={closestAssemblyContest.margin.toLocaleString()}
            detail={`${closestAssemblyContest.name} margin`}
            accent="#8a6548"
          />
        </Box>
        <AssemblyTable rows={filteredAssemblies} />
      </ChartCard>
    </Box>
  )}
  {tab === 3 && <Box className="content-grid"><ChartCard title="Electoral indicators" subtitle="Transparent formulas with source-backed denominators"><Indicator title="Vote share" value={`${(selected.votes/selected.valid*100).toFixed(1)}%`} formula="candidate votes ÷ total valid votes × 100" source="ECI result dataset"/><Indicator title="Winning margin" value={selectedMargin.toLocaleString()} formula="winner votes − runner-up votes" source="ECI result dataset"/><Indicator title="Winning margin %" value={`${(selectedMargin/selected.valid*100).toFixed(1)}%`} formula="margin ÷ total valid votes × 100" source="ECI result dataset"/><Indicator title="Turnout" value={`${selected.turnout}%`} formula="votes cast ÷ registered electors × 100" source="ECI result dataset"/></ChartCard><ChartCard title="Margin trend" subtitle="Winner's vote lead by Lok Sabha election"><ResponsiveContainer width="100%" height={315}><LineChart data={elections.slice().reverse().map(e=>({year:e.year,margin:e.votes-e.runner}))}><CartesianGrid vertical={false} stroke={chartColors.grid}/><XAxis dataKey="year"/><YAxis/><RechartsTooltip/><Line type="monotone" dataKey="margin" stroke={chartColors.series} strokeWidth={3} dot={{fill:chartColors.series,r:5}}/></LineChart></ResponsiveContainer></ChartCard></Box>}
  {tab === 4 && <Box className="stack-section"><ChartCard title="Sources & methodology" subtitle="Data lineage for every metric in this dashboard"><Stack spacing={2}><Source title="Election Commission of India · General Elections 2024" url="results.eci.gov.in" detail="Candidate votes, valid votes, electors, turnout and winning margins."/><Source title="Election Commission of India · Statistical Reports" url="eci.gov.in/statistical-reports" detail="Historical Lok Sabha results for 2009, 2014 and 2019."/><Source title="Census of India 2011" url="censusindia.gov.in" detail="Population, literacy, gender and rural / urban reference figures."/></Stack><Box className="notice"><ShieldCheck size={18}/><Typography variant="body2">This dashboard uses a local data snapshot, not a live Election Commission feed. Verify election figures against the linked ECI publications before formal use. Census figures are constituency-aligned estimates from district tables.</Typography></Box></ChartCard></Box>}
  </Box>
  </Box></Box></ThemeProvider>
}
function Sidebar({navItems,tab,setTab,close,assemblySegmentCount}:{navItems:readonly (readonly [string, typeof LayoutDashboard])[];tab:number;setTab:(n:number)=>void;close?:()=>void;assemblySegmentCount:number}) { return <Box className="sidebar"><Box className="sidebar-heading"><Typography variant="caption">WORKSPACE</Typography><IconButton size="small" className="mobile-close" onClick={close}><X size={18}/></IconButton></Box><WorkspaceSwitcher profile={constituencyProfile} assemblySegmentCount={assemblySegmentCount}/><Typography className="nav-label">ANALYZE</Typography>{navItems.map(([label,Icon],i)=><Button key={label} className={`nav-item ${tab===i?'active':''}`} onClick={()=>{setTab(i);close?.()}} startIcon={<Icon size={17}/>} endIcon={i===0?<Chip label="Live" size="small" className="live-chip"/>:undefined}>{label}</Button>)}<Box className="sidebar-spacer"/><Button className="nav-item" startIcon={<Settings size={17}/>}>Workspace settings</Button><Box className="sidebar-footer"><Sparkles size={16}/><Typography variant="caption">Insight mode<br/><b>Data-backed analysis</b></Typography></Box></Box> }
function ProfileRow({label,value}:{label:string;value:string}) { return <Stack direction="row" sx={{ justifyContent:'space-between' }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="caption" sx={{ fontWeight:800 }}>{value}</Typography></Stack> }
function AssemblyTable({rows,nameLabel='Assembly constituency'}:{rows:{name:string;no:string;winner:string;party:string;votes:number;share:number;margin:number}[];nameLabel?:string}) { return <Box sx={{overflowX:'auto'}}><table className="data-table"><thead><tr><th>{nameLabel}</th><th>Winner</th><th>Party</th><th>Votes</th><th>Vote share</th><th>Margin</th></tr></thead><tbody>{rows.map((r,i)=><tr key={`${r.name}-${i}`}><td><Typography variant="body2" sx={{ fontWeight:700 }}>{r.no !== r.party && `${r.no} · `}{r.name}</Typography></td><td>{r.winner}</td><td><Chip label={r.party} size="small" sx={{bgcolor:partyColors[r.party]?.light ?? '#eef1ef',color:partyColors[r.party]?.main ?? '#52605c',fontWeight:800}}/></td><td>{r.votes.toLocaleString()}</td><td>{r.share}%</td><td>{r.margin.toLocaleString()}</td></tr>)}</tbody></table></Box> }
function Indicator({title,value,formula,source}:{title:string;value:string;formula:string;source:string}) { return <Box className="indicator"><Stack direction="row" sx={{ justifyContent:'space-between', alignItems:'center' }}><Typography sx={{ fontWeight:800 }}>{title}</Typography><Typography variant="h5" color="primary">{value}</Typography></Stack><Typography variant="caption" color="text.secondary">{formula}</Typography><Typography variant="caption" sx={{ display:'block', mt:.5, color:'#8f6548' }}>Source · {source}</Typography><LinearProgress variant="determinate" value={Math.min(Number.parseFloat(value)||0,100)} sx={{mt:1}}/></Box> }
function Source({title,url,detail}:{title:string;url:string;detail:string}) { return <Stack direction="row" sx={{ gap:2, alignItems:'flex-start' }}><Box className="source-icon"><FileText size={17}/></Box><Box><Typography sx={{ fontWeight:800 }}>{title}</Typography><Typography variant="caption" color="primary">{url}</Typography><Typography variant="body2" color="text.secondary" sx={{ display:'block', mt:.5 }}>{detail}</Typography></Box></Stack> }
