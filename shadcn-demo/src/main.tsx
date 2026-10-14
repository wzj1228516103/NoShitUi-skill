import { useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { ArrowUpRight, Bell, Check, ChevronLeft, ChevronRight, CircleHelp, Command, Download, LayoutDashboard, Menu, MoreHorizontal, Package, Plus, Search, Settings2, Sparkles, Users, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "@/index.css"

type Status = "Processing" | "Ready" | "Review"
type Order = { id: string; customer: string; email: string; item: string; amount: string; status: Status; date: string; initials: string }

const initialOrders: Order[] = [
  { id: "ORD-1048", customer: "Maya Chen", email: "maya@northstar.co", item: "Pro workspace", amount: "$240.00", status: "Ready", date: "Oct 12, 2026", initials: "MC" },
  { id: "ORD-1047", customer: "Jon Bell", email: "jon@relay.studio", item: "Team seats × 12", amount: "$480.00", status: "Processing", date: "Oct 12, 2026", initials: "JB" },
  { id: "ORD-1046", customer: "Rina Patel", email: "rina@kinetic.health", item: "API access", amount: "$120.00", status: "Review", date: "Oct 11, 2026", initials: "RP" },
  { id: "ORD-1045", customer: "Alex Morgan", email: "alex@commonroom.io", item: "Pro workspace", amount: "$240.00", status: "Ready", date: "Oct 11, 2026", initials: "AM" },
  { id: "ORD-1044", customer: "Noah Williams", email: "noah@supergrain.dev", item: "Team seats × 5", amount: "$200.00", status: "Processing", date: "Oct 10, 2026", initials: "NW" },
  { id: "ORD-1043", customer: "Sofia Kim", email: "sofia@frame.work", item: "API access", amount: "$120.00", status: "Ready", date: "Oct 09, 2026", initials: "SK" },
]

const statusVariant: Record<Status, "success" | "warning" | "danger"> = { Ready: "success", Processing: "warning", Review: "danger" }

function App() {
  const [orders, setOrders] = useState(initialOrders)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<Status | "All">("All")
  const [selected, setSelected] = useState<Order | null>(null)
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState("")
  const [mobileNav, setMobileNav] = useState(false)

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const haystack = `${order.id} ${order.customer} ${order.email} ${order.item}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) && (status === "All" || order.status === status)
  }), [orders, query, status])

  function notify(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }

  function saveOrder() {
    if (!selected) return
    setOrders((current) => current.map((order) => order.id === selected.id ? selected : order))
    setSaved(true)
    notify(`${selected.id} updated`)
    window.setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>shadcn<span className="brand-muted">/ops</span></span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">N</div><div><strong>Northstar, Inc.</strong><span>Operations</span></div><ChevronRight size={15} /></div>
        <nav className="nav-list" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          <a className="nav-item active" href="#overview" onClick={() => setMobileNav(false)}><LayoutDashboard size={16} /> Overview</a>
          <a className="nav-item" href="#orders" onClick={() => setMobileNav(false)}><Package size={16} /> Orders <span className="nav-count">24</span></a>
          <a className="nav-item" href="#customers" onClick={() => setMobileNav(false)}><Users size={16} /> Customers</a>
          <p className="nav-label nav-label-spaced">Manage</p>
          <a className="nav-item" href="#settings" onClick={() => setMobileNav(false)}><Settings2 size={16} /> Settings</a>
          <a className="nav-item" href="#help" onClick={() => setMobileNav(false)}><CircleHelp size={16} /> Help center</a>
        </nav>
        <div className="sidebar-footer"><div className="avatar avatar-indigo">JL</div><div><strong>Jordan Lee</strong><span>Admin</span></div><MoreHorizontal size={16} /></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu size={19} /></Button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>Overview</strong></div><div className="topbar-actions"><Button variant="outline" size="sm" className="command-button"><Command size={14} /> <span>Quick search</span><kbd>⌘ K</kbd></Button><Button variant="ghost" size="icon" aria-label="Notifications"><Bell size={17} /></Button><a className="github-link" href="https://github.com/shadcn-ui/ui" target="_blank" rel="noreferrer">Built with shadcn/ui <ArrowUpRight size={13} /></a></div></header>

        <div className="page-wrap">
          <section className="page-heading" id="overview"><div><div className="eyebrow"><span className="status-dot" /> Live workspace</div><h1>Good morning, Jordan.</h1><p>Here is what is happening across your workspace today.</p></div><div className="heading-actions"><Button variant="outline" onClick={() => notify("Report exported") }><Download size={15} /> Export</Button><Dialog><DialogTrigger asChild><Button><Plus size={16} /> New order</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create an order</DialogTitle><DialogDescription>Orders created here will appear in the workspace table.</DialogDescription></DialogHeader><div className="dialog-form"><label>Customer <Input placeholder="name@company.com" /></label><label>Product <Input placeholder="Pro workspace" /></label><Button onClick={() => notify("New order draft created")}>Create draft</Button></div></DialogContent></Dialog></div></section>

          <section className="metrics-grid" aria-label="Workspace metrics"><MetricCard label="Net revenue" value="$24,680" delta="+12.4%" detail="vs. last month" tone="green" /><MetricCard label="Active customers" value="1,284" delta="+8.2%" detail="vs. last month" tone="blue" /><MetricCard label="Open orders" value="24" delta="3 need review" detail="right now" tone="amber" /><MetricCard label="Avg. response" value="2h 18m" delta="-14.6%" detail="vs. last month" tone="purple" /></section>

          <section className="content-grid"><Card className="chart-card"><CardHeader className="card-row"><div><CardTitle>Revenue overview</CardTitle><CardDescription>Monthly recurring revenue</CardDescription></div><Select defaultValue="6 months"><SelectTrigger className="period-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="6 months">Last 6 months</SelectItem><SelectItem value="year">This year</SelectItem></SelectContent></Select></CardHeader><CardContent><div className="chart-summary"><strong>$24,680</strong><span className="positive"><ArrowUpRight size={14} /> 12.4%</span></div><RevenueChart /></CardContent></Card><Card className="activity-card"><CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Updates from your team</CardDescription></CardHeader><CardContent><div className="activity-list"><Activity icon={<Check />} title="Order ORD-1048 fulfilled" time="12 minutes ago" color="green" /><Activity icon={<Users />} title="New team member invited" time="46 minutes ago" color="blue" /><Activity icon={<Package />} title="Order ORD-1046 needs review" time="2 hours ago" color="amber" /><Activity icon={<Sparkles />} title="Workspace upgraded" time="Yesterday" color="purple" /></div><Button variant="ghost" className="view-all" onClick={() => notify("All activity is up to date")}>View all activity <ArrowUpRight size={14} /></Button></CardContent></Card></section>

          <section className="orders-section" id="orders"><div className="section-heading"><div><h2>Orders</h2><p>Manage and track recent customer orders.</p></div><Button variant="outline" size="sm" onClick={() => notify("Filters are ready")}>Advanced filters <Settings2 size={14} /></Button></div><Card><div className="table-toolbar"><div className="search-wrap"><Search size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." aria-label="Search orders" /></div><Select value={status} onValueChange={(value) => setStatus(value as Status | "All")}><SelectTrigger className="status-select"><SelectValue placeholder="All status" /></SelectTrigger><SelectContent><SelectItem value="All">All status</SelectItem><SelectItem value="Ready">Ready</SelectItem><SelectItem value="Processing">Processing</SelectItem><SelectItem value="Review">Review</SelectItem></SelectContent></Select></div><div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id}><td><span className="order-id">{order.id}</span></td><td><div className="customer-cell"><span className="avatar avatar-slate">{order.initials}</span><span><strong>{order.customer}</strong><small>{order.email}</small></span></div></td><td>{order.item}</td><td className="amount">{order.amount}</td><td><Badge variant={statusVariant[order.status]}><span className="badge-dot" />{order.status}</Badge></td><td className="date">{order.date}</td><td><Button variant="ghost" size="icon" className="row-action" aria-label={`Edit ${order.id}`} onClick={() => setSelected(order)}><MoreHorizontal size={17} /></Button></td></tr>)}{filteredOrders.length === 0 && <tr><td colSpan={7} className="empty-cell">No orders match those filters.</td></tr>}</tbody></table></div><div className="table-footer"><span>Showing {filteredOrders.length} of {orders.length} orders</span><div><Button variant="outline" size="icon" disabled><ChevronLeft size={15} /></Button><Button variant="outline" size="icon"><ChevronRight size={15} /></Button></div></div></Card></section>

          <footer className="app-footer"><span>SHADCN OPS / UI ATLAS DEMO</span><a href="https://github.com/shadcn-ui/ui" target="_blank" rel="noreferrer">View the source components <ArrowUpRight size={13} /></a></footer>
        </div>
      </main>

      {selected && <Dialog open onOpenChange={(open) => !open && setSelected(null)}><DialogContent><DialogHeader><DialogTitle>Edit {selected.id}</DialogTitle><DialogDescription>Update the order details and save when ready.</DialogDescription></DialogHeader><div className="dialog-form"><label>Customer <Input value={selected.customer} onChange={(event) => setSelected({ ...selected, customer: event.target.value })} /></label><label>Status <Select value={selected.status} onValueChange={(value) => setSelected({ ...selected, status: value as Status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Ready">Ready</SelectItem><SelectItem value="Processing">Processing</SelectItem><SelectItem value="Review">Review</SelectItem></SelectContent></Select></label><Button onClick={saveOrder}>{saved ? <><Check size={15} /> Saved</> : "Save changes"}</Button></div></DialogContent></Dialog>}
      {notice && <div className="toast" role="status"><Check size={15} /> {notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={14} /></button></div>}
    </div>
  )
}

function MetricCard({ label, value, delta, detail, tone }: { label: string; value: string; delta: string; detail: string; tone: string }) {
  return <Card className="metric-card"><CardHeader><div className={`metric-icon ${tone}`}><Sparkles size={15} /></div><CardTitle>{label}</CardTitle></CardHeader><CardContent><div className="metric-value">{value}</div><div className="metric-detail"><span className={tone === "amber" ? "amber-text" : "positive"}>{delta}</span> {detail}</div></CardContent></Card>
}

function Activity({ icon, title, time, color }: { icon: React.ReactNode; title: string; time: string; color: string }) {
  return <div className="activity-item"><span className={`activity-icon ${color}`}>{icon}</span><div><strong>{title}</strong><span>{time}</span></div></div>
}

function RevenueChart() {
  return <div className="chart" aria-label="Revenue rises from January to June"><div className="chart-grid"><span>$30k</span><span>$20k</span><span>$10k</span><span>$0</span></div><svg viewBox="0 0 700 170" role="img" aria-label="Revenue chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".3" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs><path d="M0 143 C50 139, 67 129, 112 130 S177 119, 225 122 S285 101, 337 109 S403 92, 450 83 S515 88, 562 60 S640 55, 700 24 V170 H0 Z" fill="url(#fill)" /><path d="M0 143 C50 139, 67 129, 112 130 S177 119, 225 122 S285 101, 337 109 S403 92, 450 83 S515 88, 562 60 S640 55, 700 24" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-labels"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div></div>
}

export default App

createRoot(document.getElementById("root")!).render(<App />)
