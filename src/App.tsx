/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  RefreshCw,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  risks, 
  controls, 
  findings, 
  vendors, 
  findingsTrend, 
  SeveritySubset, 
  Framework, 
  FindingStatus 
} from './data/mockData';

// --- Components ---

const StatCard = ({ title, value, delta, subText, colorClass }: { 
  title: string; 
  value: string | number; 
  delta?: string | number; 
  subText?: string;
  colorClass: string;
}) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={cn("absolute top-0 left-0 w-1 h-full", colorClass)} />
    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-900">{value}</span>
      {delta && (
        <span className={cn(
          "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
          String(delta).startsWith('+') ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
        )}>
          {String(delta).startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {delta}
        </span>
      )}
    </div>
    {subText && <p className="mt-1 text-xs text-slate-400">{subText}</p>}
  </div>
);

const ChartContainer = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white p-6 rounded-xl border border-slate-200 shadow-sm", className)}>
    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      {title}
    </h3>
    <div className="h-[280px] w-full">
      {children}
    </div>
  </div>
);

// --- Sub-components (Heatmap) ---
const Heatmap = ({ data }: { data: { impact: number, likelihood: number, count: number }[] }) => {
  const cells = [];
  for (let i = 5; i >= 1; i--) {
    for (let j = 1; j <= 5; j++) {
      const match = data.find(d => d.impact === i && d.likelihood === j);
      const intensity = match ? Math.min(match.count * 10, 100) : 0;
      cells.push(
        <div 
          key={`${i}-${j}`} 
          className="aspect-square flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105"
          style={{ 
            backgroundColor: intensity > 0 ? `rgba(239, 68, 68, ${0.1 + (intensity / 100)})` : '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
          title={`Impact: ${i}, Likelihood: ${j}, Count: ${match?.count || 0}`}
        >
          {match?.count || ''}
        </div>
      );
    }
  }

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col justify-between py-2 pr-2 text-[10px] font-bold text-slate-400">
        <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-1 w-full h-full">
          {cells}
        </div>
        <div className="grid grid-cols-5 gap-1 mt-2 text-[10px] font-bold text-slate-400 text-center">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  // Filters
  const [framework, setFramework] = useState<Framework | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<SeveritySubset[]>(['Critical', 'High', 'Medium', 'Low']);
  const [findingsFilter, setFindingsFilter] = useState<FindingStatus | 'All'>('All');
  const [lastRefreshed] = useState(new Date().toLocaleTimeString());

  // Password Verification (Simulated HMAC comparison via standard string equality for demo)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = (import.meta as any).env.VITE_APP_PASSWORD;
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
      // Standard security practice: clear error and don't provide hints
      setTimeout(() => setError(false), 2000);
    }
  };

  // Data Processing
  const filteredRisks = useMemo(() => 
    risks.filter(r => (framework === 'All' || r.frameworks.includes(framework)) && severityFilter.includes(r.severity)),
    [framework, severityFilter]
  );

  const filteredControls = useMemo(() => 
    controls.filter(c => framework === 'All' || c.framework === framework),
    [framework]
  );

  const filteredFindings = useMemo(() => 
    findings.filter(f => 
      (framework === 'All' || f.framework === framework) && 
      (findingsFilter === 'All' || f.status === findingsFilter)
    ),
    [framework, findingsFilter]
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFindingsBySearch = useMemo(() => 
    filteredFindings.filter(f => 
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [filteredFindings, searchQuery]
  );

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Severity', 'Date', 'Framework'];
    const rows = filteredFindingsBySearch.map(f => [
      f.id,
      f.title,
      f.status,
      f.severity,
      f.date,
      f.framework
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `compliance_findings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const riskBySeverity = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    filteredRisks.forEach(r => counts[r.severity]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRisks]);

  const vendorRiskDistribution = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    vendors.forEach(v => counts[v.riskTier]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const heatmapData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRisks.forEach(r => {
      const key = `${r.impact}-${r.likelihood}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, count]) => {
      const [impact, likelihood] = key.split('-').map(Number);
      return { impact, likelihood, count };
    });
  }, [filteredRisks]);

  const controlRateByFramework = useMemo(() => {
    return ['NIST CSF 2.0', 'SOC 2', 'ISO 27001'].map(fw => {
      const fwControls = controls.filter(c => c.framework === fw);
      const pass = fwControls.filter(c => c.status === 'Pass').length;
      const fail = fwControls.filter(c => c.status === 'Fail').length;
      const progress = fwControls.filter(c => c.status === 'In-Progress').length;
      return { name: fw, pass, fail, progress };
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 underline decoration-indigo-500/50 decoration-4 underline-offset-4">Compliance Metrics Dashboard</h1>
            <p className="text-slate-400 text-sm mb-8">Access the restricted compliance dashboard</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest ml-1 mb-2 block">System Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure key"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                Unlock Dashboard
                <ChevronRight className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-lg p-3"
                  >
                    <p className="text-red-400 text-xs font-medium">Access Denied: Invalid credentials provided.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
          <div className="bg-slate-700/30 p-4 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-[10px] uppercase tracking-tighter">HMAC-safe comparison enabled | Sandbox environment</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar Nav */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold ring-4 ring-indigo-500/10 transition-transform hover:scale-110">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight uppercase">Compliance Metrics</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Specification Group */}
          <div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
              <Filter className="w-3 h-3" /> Specification
            </div>
            <div className="space-y-1">
              {['All', 'NIST CSF 2.0', 'SOC 2', 'ISO 27001'].map((fw) => (
                <button
                  key={fw}
                  onClick={() => setFramework(fw as any)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3",
                    framework === fw 
                      ? "bg-indigo-600/10 text-indigo-400 font-medium" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    framework === fw ? "bg-indigo-500" : "bg-slate-700"
                  )} />
                  {fw}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filters */}
          <div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> Risk Thresholds
            </div>
            <div className="space-y-2 px-2">
              {['Critical', 'High', 'Medium', 'Low'].map((s) => (
                <label key={s} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer hidden"
                      checked={severityFilter.includes(s as any)}
                      onChange={(e) => {
                        if (e.target.checked) setSeverityFilter([...severityFilter, s as any]);
                        else setSeverityFilter(severityFilter.filter(item => item !== s));
                      }}
                    />
                    <div className="w-4 h-4 border border-slate-600 rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </nav>

        {/* Build Status Style Footer Sidebar */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <RefreshCw className="w-3 h-3 animate-spin-slow" />
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Compliance Health</div>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-white font-bold text-sm">Synthetic Mode</span>
              <span className="text-indigo-400 text-[10px] font-mono">{lastRefreshed}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[78%] transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
            </div>
            <p className="mt-2 text-[9px] text-slate-500 leading-relaxed italic">Engine online: Scanning 260+ compliance entities.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar / Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Compliance Metrics Dashboard</h1>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-widest border border-green-200 ring-4 ring-green-500/5">Secure & Verified</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4 border-r border-slate-100 pr-4 hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator Role</p>
              <p className="text-xs font-semibold text-slate-700">security_admin_v2</p>
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              Refresh Audit
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95 hover:shadow-indigo-500/20">
              Generate Report
            </button>
          </div>
        </header>

        {/* Global Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-slate-50/50">
          {/* Row 1: KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Open Risks" 
              value={filteredRisks.length} 
              delta={`+${filteredRisks.filter(r => r.severity === 'Critical').length}`}
              subText="Critical items needing mitigation"
              colorClass="bg-red-500"
            />
            <StatCard 
              title="Controls Passing" 
              value={`${Math.round((filteredControls.filter(c => c.status === 'Pass').length / filteredControls.length) * 100)}%`} 
              subText="Across all active frameworks"
              colorClass="bg-indigo-500"
            />
            <StatCard 
              title="Overdue Findings" 
              value={filteredFindings.filter(f => f.status === 'Overdue').length} 
              delta={-2}
              subText="SLA breach notification triggered"
              colorClass="bg-amber-500"
            />
            <StatCard 
              title="Critical Vendors" 
              value={vendors.filter(v => v.riskTier === 'Critical').length} 
              subText="High-risk supply chain entities"
              colorClass="bg-purple-500"
            />
          </section>

          {/* Row 2: Analysis Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer title="Open Risks by Severity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskBySeverity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {riskBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'Critical' ? '#ef4444' : 
                        entry.name === 'High' ? '#f97316' : 
                        entry.name === 'Medium' ? '#f59e0b' : '#10b981'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Audit Findings Trend (12m Cycle)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={findingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </section>

          {/* Row 3: Supply Chain & Risk Heatmap */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer title="Vendor Risk Tier Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorRiskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {vendorRiskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'Critical' ? '#ef4444' : 
                        entry.name === 'High' ? '#f97316' : 
                        entry.name === 'Medium' ? '#f59e0b' : '#10b981'
                      } />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Risk Impact vs Likelihood Matrix">
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0 bg-slate-50/50 rounded-xl border border-slate-100 p-2">
                  <Heatmap data={heatmapData} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Likelihood Axis →</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-red-500/10" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Heat Intensity (Risk Count)</span>
                  </div>
                </div>
              </div>
            </ChartContainer>
          </section>

          {/* Row 4: Controls Mastery */}
          <ChartContainer title="Control Performance by Enterprise Framework" className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controlRateByFramework}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />
                <Bar dataKey="pass" name="Pass" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="fail" name="Fail" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="progress" name="In-Progress" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Row 5: Data Registry */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Active Findings Registry</h3>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Audit Trail & Mitigation Log</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search findings (Ref ID)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64 shadow-sm"
                  />
                </div>
                <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                  {['All', 'Open', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFindingsFilter(status as any)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                        findingsFilter === status ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement Violation</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational State</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Impact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Framework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredFindingsBySearch.slice(0, 8).map((f) => (
                    <tr key={f.id} className="hover:bg-indigo-50/20 transition-colors group cursor-default">
                      <td className="px-8 py-4 font-mono text-[11px] text-indigo-600 font-bold bg-slate-50/30 group-hover:bg-indigo-50/50">{f.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{f.title}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                          f.status === 'Open' ? "bg-amber-50 text-amber-600 border-amber-200" :
                          f.status === 'Overdue' ? "bg-red-50 text-red-600 border-red-200" :
                          "bg-emerald-50 text-emerald-600 border-emerald-200"
                        )}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-block w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 ring-slate-50",
                          f.severity === 'Critical' ? "bg-red-500 animate-pulse" :
                          f.severity === 'High' ? "bg-orange-500" :
                          f.severity === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-500 transition-colors px-2 py-1 bg-slate-100 rounded group-hover:bg-indigo-50">{f.framework}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-[11px] text-slate-500 font-medium italic">Synchronized with remote GRC vault. 128-bit encryption active.</p>
              </div>
              <button 
                onClick={exportToCSV}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                Export findings (CSV) <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar / Footer */}
        <footer className="h-10 bg-white border-t border-slate-200 flex items-center px-8 justify-between text-[10px] font-bold text-slate-500 shrink-0 uppercase tracking-widest z-10">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> GRC Engine: Operational</span>
            <div className="w-px h-3 bg-slate-200" />
            <span className="text-slate-400">Node Cluster: COMPLIANCE-PRJ-01</span>
          </div>
          <div className="flex items-center gap-6">
             <span className="text-indigo-500">Security Verified</span>
             <div className="w-px h-3 bg-slate-200" />
             <div className="font-mono text-slate-400">v2.0.4-LTS-STABLE</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
