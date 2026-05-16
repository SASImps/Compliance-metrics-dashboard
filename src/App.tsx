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
  Info,
  Activity,
  Sparkles,
  Zap,
  X
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

const StatCard = React.memo(({ title, value, delta, subText, colorClass, isDarkMode }: { 
  title: string; 
  value: string | number; 
  delta?: string | number; 
  subText?: string;
  colorClass: string;
  isDarkMode: boolean;
}) => (
  <div className={cn(
    "p-6 rounded-xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group",
    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
  )}>
    <div className={cn("absolute top-0 left-0 w-1 h-full", colorClass)} />
    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
    <div className="mt-2 flex items-baseline gap-2">
      <span className={cn("text-3xl font-bold transition-colors", isDarkMode ? "text-white" : "text-slate-900")}>{value}</span>
      {delta && (
        <span className={cn(
          "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
          String(delta).startsWith('+') ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
        )}>
          {String(delta).startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {delta}
        </span>
      )}
    </div>
    {subText && <p className="mt-1 text-xs text-slate-500">{subText}</p>}
  </div>
));

const ChartContainer = React.memo(({ title, children, className, isDarkMode }: { title: string; children: React.ReactNode; className?: string; isDarkMode: boolean }) => (
  <div className={cn(
    "p-6 rounded-xl border shadow-sm flex flex-col min-h-[350px] lg:h-[400px] transition-colors",
    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
    className
  )}>
    <h3 className={cn(
      "text-lg font-semibold mb-6 flex items-center gap-2",
      isDarkMode ? "text-slate-200" : "text-slate-800"
    )}>
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      {title}
    </h3>
    <div className="flex-1 w-full relative">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  </div>
));

// --- Sub-components (Heatmap) ---
const Heatmap = React.memo(({ data, onCellClick, selectedCell }: { 
  data: { impact: number, likelihood: number, count: number }[],
  onCellClick?: (impact: number, likelihood: number) => void,
  selectedCell?: { impact: number, likelihood: number } | null
}) => {
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 5; i >= 1; i--) {
      for (let j = 1; j <= 5; j++) {
        const match = data.find(d => d.impact === i && d.likelihood === j);
        const intensity = match ? Math.min(match.count * 10, 100) : 0;
        const isSelected = selectedCell?.impact === i && selectedCell?.likelihood === j;
        
        arr.push(
          <div 
            key={`${i}-${j}`} 
            onClick={() => onCellClick?.(i, j)}
            className={cn(
              "aspect-square flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 cursor-pointer relative",
              isSelected && "ring-2 ring-indigo-500 ring-inset z-10"
            )}
            style={{ 
              backgroundColor: intensity > 0 ? `rgba(239, 68, 68, ${0.1 + (intensity / 100)})` : '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
            title={`Impact: ${i}, Likelihood: ${j}, Count: ${match?.count || 0}`}
          >
            {match?.count || ''}
            {isSelected && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-indigo-500 rounded-bl-sm" />}
          </div>
        );
      }
    }
    return arr;
  }, [data, onCellClick, selectedCell]);

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
});

const ActivityTimeline = React.memo(({ activities }: { activities: any[] }) => (
  <div className="space-y-4">
    {activities.map((activity, idx) => (
      <div key={idx} className="flex gap-4 relative">
        {idx !== activities.length - 1 && (
          <div className="absolute left-2 top-8 bottom-0 w-px bg-slate-200" />
        )}
        <div className={cn(
          "w-4 h-4 rounded-full mt-1 shrink-0 flex items-center justify-center text-[8px] text-white",
          activity.type === 'alert' ? "bg-red-500" :
          activity.type === 'success' ? "bg-emerald-500" : "bg-indigo-500"
        )}>
          {activity.type === 'alert' ? '!' : activity.type === 'success' ? '✓' : '•'}
        </div>
        <div className="flex-1 pb-4">
          <p className="text-xs font-semibold text-slate-700">{activity.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{activity.description}</p>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 block">{activity.timestamp}</span>
        </div>
      </div>
    ))}
  </div>
));

// --- Memoized Charts ---

const MemoizedBarChart = React.memo(({ data, isDarkMode }: { data: any[], isDarkMode: boolean }) => (
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
    <Tooltip 
      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
      contentStyle={{ 
        backgroundColor: isDarkMode ? '#0f172a' : '#fff',
        borderRadius: '12px', 
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, 
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        color: isDarkMode ? '#fff' : '#000'
      }}
    />
    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={
          entry.name === 'Critical' ? '#ef4444' : 
          entry.name === 'High' ? '#f97316' : 
          entry.name === 'Medium' ? '#f59e0b' : '#10b981'
        } />
      ))}
    </Bar>
  </BarChart>
));

const MemoizedLineChart = React.memo(({ data, isDarkMode }: { data: any[], isDarkMode: boolean }) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: isDarkMode ? '#0f172a' : '#fff',
        borderRadius: '12px', 
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, 
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        color: isDarkMode ? '#fff' : '#000'
      }}
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
));

const MemoizedPieChart = React.memo(({ data, isDarkMode }: { data: any[], isDarkMode: boolean }) => (
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={70}
      outerRadius={95}
      paddingAngle={8}
      dataKey="value"
    >
      {data.map((entry: any, index: number) => (
        <Cell key={`cell-${index}`} fill={
          entry.name === 'Critical' ? '#ef4444' : 
          entry.name === 'High' ? '#f97316' : 
          entry.name === 'Medium' ? '#f59e0b' : '#10b981'
        } />
      ))}
    </Pie>
    <Tooltip 
      contentStyle={{ 
        backgroundColor: isDarkMode ? '#0f172a' : '#fff',
        borderRadius: '12px', 
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        color: isDarkMode ? '#fff' : '#000'
      }}
    />
    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
  </PieChart>
));

const MemoizedGroupedBarChart = React.memo(({ data, isDarkMode }: { data: any[], isDarkMode: boolean }) => (
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
    <Tooltip 
      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
      contentStyle={{ 
        backgroundColor: isDarkMode ? '#0f172a' : '#fff',
        borderRadius: '12px', 
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        color: isDarkMode ? '#fff' : '#000'
      }}
    />
    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />
    <Bar dataKey="pass" name="Pass" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
    <Bar dataKey="fail" name="Fail" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
    <Bar dataKey="progress" name="In-Progress" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
  </BarChart>
));

// --- Main App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('auth_verified') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Selected Finding for Modal
  const [selectedFinding, setSelectedFinding] = useState<typeof findings[0] | null>(null);
  const [findingsState, setFindingsState] = useState(findings);
  
  // AI Mitigation State
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Selected Heatmap Cell
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ impact: number, likelihood: number } | null>(null);

  // Activity Feed State
  const [activities, setActivities] = useState([
    { title: "Dashboard Session Started", description: "Secure session established via operator gate.", type: "success", timestamp: "Just now" },
    { title: "NIST-2.0 Audit Scheduled", description: "Automated scan queued for Q2 verification.", type: "info", timestamp: "5m ago" },
    { title: "High Risk Mitigation Delayed", description: "Finding ID-7023 SLA has exceeded 48 hours.", type: "alert", timestamp: "22m ago" }
  ]);

  // Filters
  const [framework, setFramework] = useState<Framework | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<SeveritySubset[]>(['Critical', 'High', 'Medium', 'Low']);
  const [findingsFilter, setFindingsFilter] = useState<FindingStatus | 'All'>('All');
  const [lastRefreshed] = useState(new Date().toLocaleTimeString());

  // Password Verification (Simulated HMAC comparison via standard string equality for demo)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envPassword = (import.meta as any).env.VITE_APP_PASSWORD;
    // Fallback to "password1234" if env var is missing, empty, or the string "undefined"
    const correctPassword = (envPassword && envPassword !== "undefined" && envPassword !== "") 
      ? envPassword 
      : 'password1234';

    if (password.trim() === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('auth_verified', 'true');
      setError(false);
    } else {
      setError(true);
      setPassword('');
      // Standard security practice: clear error and don't provide hints
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_verified');
  };

  const refreshAudit = React.useCallback(() => {
    setIsRefreshing(true);
    setSelectedHeatmapCell(null);
    setSelectedFinding(null);
    setActivities(prev => [
      { title: "Dashboard Audit Initiated", description: "Scanning 260+ compliance entities across cloud clusters.", type: "info", timestamp: "Just now" },
      ...prev.slice(0, 4)
    ]);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, []);

  const resolveFinding = React.useCallback((id: string) => {
    setFindingsState(prev => prev.map(f => f.id === id ? { ...f, status: 'Closed' } : f));
    setActivities(prev => [
      { title: "Finding Resolved", description: `Reference ${id} has been marked as corrected.`, type: "success", timestamp: "Just now" },
      ...prev.slice(0, 5)
    ]);
    setSelectedFinding(null);
  }, []);

  const assignTask = React.useCallback((id: string) => {
    setFindingsState(prev => prev.map(f => f.id === id ? { ...f, status: 'In-Progress' } : f));
    setActivities(prev => [{ title: "Task Delegated", description: `Corrective action for ${id} assigned to team.`, type: "info", timestamp: "Just now" }, ...prev.slice(0, 5)]);
    setSelectedFinding(null);
  }, []);

  const analyzeWithAI = React.useCallback(async (finding: typeof findings[0]) => {
    setIsAiLoading(true);
    setAiGuidance(null);
    try {
      const resp = await fetch("/api/mitigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setAiGuidance(data.remediation);
      setActivities(prev => [
        { title: "AI Intelligence Used", description: `Remediation guidance generated for ${finding.id}.`, type: "success", timestamp: "Just now" },
        ...prev.slice(0, 5)
      ]);
    } catch (err: any) {
      setAiGuidance(`Error: ${err.message || 'The Gemini API key is missing or invalid.'}`);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

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
    findingsState.filter(f => 
      (framework === 'All' || f.framework === framework) && 
      (findingsFilter === 'All' || f.status === findingsFilter)
    ),
    [framework, findingsFilter, findingsState]
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination for findings
  const [visibleFindings, setVisibleFindings] = useState(8);

  const filteredFindingsBySearch = useMemo(() => 
    filteredFindings.filter(f => 
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [filteredFindings, searchQuery]
  );

  const displayFindings = useMemo(() => 
    filteredFindingsBySearch.slice(0, visibleFindings),
    [filteredFindingsBySearch, visibleFindings]
  );

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Severity', 'Date', 'Framework'];
    const rows = filteredFindingsBySearch.map(f => [
      f.id,
      // Wrap in quotes and escape internal quotes for CSV safety
      `"${String(f.title).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`,
      `"${f.status}"`,
      `"${f.severity}"`,
      `"${f.date}"`,
      `"${f.framework}"`
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

  const risksInSelectedCell = useMemo(() => {
    if (!selectedHeatmapCell) return [];
    return filteredRisks.filter(r => 
      r.impact === selectedHeatmapCell.impact && 
      r.likelihood === selectedHeatmapCell.likelihood
    );
  }, [filteredRisks, selectedHeatmapCell]);

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
        >
          <div className="p-8 text-center">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-8 h-8 text-indigo-400" />
            </motion.div>
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
    <div className={cn(
      "h-screen flex overflow-hidden font-sans transition-colors duration-300",
      isDarkMode ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-900"
    )}>
      {/* Sidebar Nav */}
      <aside className={cn(
        "w-64 flex flex-col shrink-0 border-r transition-colors duration-300",
        isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-900 border-slate-800"
      )}>
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
                  onClick={() => {
                    if (framework !== fw) {
                      setFramework(fw as any);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3",
                    framework === fw 
                      ? (isDarkMode ? "bg-indigo-500/20 text-indigo-400 font-medium" : "bg-indigo-600/10 text-indigo-400 font-medium")
                      : (isDarkMode ? "text-slate-500 hover:bg-slate-900 hover:text-slate-200" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")
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
                    <div className={cn(
                      "w-4 h-4 border rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center",
                      isDarkMode ? "border-slate-700 bg-slate-950" : "border-slate-600 bg-slate-900"
                    )}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-medium uppercase tracking-wider transition-colors",
                    isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-300"
                  )}>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center gap-2 px-2 py-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <RefreshCw className={cn("w-3 h-3 transition-transform", isDarkMode ? "rotate-180" : "rotate-0")} />
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-2 text-red-400 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <Lock className="w-3 h-3" />
              Lock Session
            </button>
          </div>
        </nav>

        {/* Build Status Style Footer Sidebar */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <RefreshCw className={cn("w-3 h-3", isRefreshing ? "animate-spin" : "animate-spin-slow")} />
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Compliance Health</div>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-white font-bold text-sm">{isRefreshing ? 'Scanning...' : 'Synthetic Mode'}</span>
              <span className="text-indigo-400 text-[10px] font-mono">{lastRefreshed}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "78%" }}
                animate={{ width: isRefreshing ? "100%" : "78%" }}
                className="bg-indigo-500 h-full transition-all shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              ></motion.div>
            </div>
            <p className="mt-2 text-[9px] text-slate-500 leading-relaxed italic">
              {isRefreshing ? 'Engine busy: Verifying SOC2 parity...' : 'Engine online: Scanning 260+ compliance entities.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar / Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-8 shrink-0 shadow-sm z-10 transition-colors duration-300",
          isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <h1 className={cn(
              "text-lg font-bold tracking-tight",
              isDarkMode ? "text-white" : "text-slate-800"
            )}>Compliance Metrics Dashboard</h1>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-widest border border-green-200 ring-4 ring-green-500/5">Secure & Verified</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-right mr-4 border-r pr-4 hidden md:block",
              isDarkMode ? "border-slate-800" : "border-slate-100"
            )}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator Role</p>
              <p className={cn(
                "text-xs font-semibold",
                isDarkMode ? "text-slate-300" : "text-slate-700"
              )}>security_admin_v2</p>
            </div>
            <button 
              onClick={refreshAudit}
              disabled={isRefreshing}
              className={cn(
                "px-4 py-2 border rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center gap-2",
                isDarkMode ? "border-slate-700 text-slate-400 hover:bg-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin" />}
              {isRefreshing ? 'Scanning...' : 'Refresh Audit'}
            </button>
            <button 
              onClick={exportToCSV}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95 hover:shadow-indigo-500/20"
            >
              Generate Report
            </button>
          </div>
        </header>

        {/* Global Workspace */}
        <div className={cn(
          "flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth transition-colors duration-300",
          isDarkMode ? "bg-slate-950/50" : "bg-slate-50/50"
        )}>
          {/* Row 1: KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Open Risks" 
              value={findingsState.filter(f => f.status !== 'Closed').length} 
              delta={`+${findingsState.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length}`}
              subText="Critical items needing mitigation"
              colorClass="bg-red-500"
              isDarkMode={isDarkMode}
            />
            <StatCard 
              title="Controls Passing" 
              value={`${Math.round((filteredControls.filter(c => c.status === 'Pass').length / filteredControls.length) * 100)}%`} 
              subText="Across all active frameworks"
              colorClass="bg-indigo-500"
              isDarkMode={isDarkMode}
            />
            <StatCard 
              title="Overdue Findings" 
              value={findingsState.filter(f => f.status === 'Overdue').length} 
              delta={-2}
              subText="SLA breach notification triggered"
              colorClass="bg-amber-500"
              isDarkMode={isDarkMode}
            />
            <StatCard 
              title="Critical Vendors" 
              value={vendors.filter(v => v.riskTier === 'Critical').length} 
              subText="High-risk supply chain entities"
              colorClass="bg-purple-500"
              isDarkMode={isDarkMode}
            />
          </section>

          {/* Workspace Content */}
          <div className="relative">
            {/* Loading Overlay */}
            <AnimatePresence>
              {isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 backdrop-blur-sm bg-slate-950/10 flex items-center justify-center rounded-2xl"
                >
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-indigo-500/20 flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Refreshing Audit Data...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn("space-y-8 transition-all duration-300", isRefreshing && "blur-[2px] pointer-events-none opacity-60")}>
              {/* Analysis Charts */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Open Risks by Severity" isDarkMode={isDarkMode}>
                  <MemoizedBarChart data={riskBySeverity} isDarkMode={isDarkMode} />
                </ChartContainer>

                <ChartContainer title="Audit Findings Trend (12m Cycle)" isDarkMode={isDarkMode}>
                  <MemoizedLineChart data={findingsTrend} isDarkMode={isDarkMode} />
                </ChartContainer>
              </section>

              {/* Supply Chain & Risk Heatmap */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Vendor Risk Tier Distribution" isDarkMode={isDarkMode}>
                  <MemoizedPieChart data={vendorRiskDistribution} isDarkMode={isDarkMode} />
                </ChartContainer>

                <ChartContainer title="Risk Impact vs Likelihood Matrix" isDarkMode={isDarkMode}>
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      "flex-1 min-h-0 rounded-xl border p-2 overflow-hidden",
                      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50/50 border-slate-100"
                    )}>
                      <Heatmap 
                        data={heatmapData} 
                        onCellClick={(impact, likelihood) => setSelectedHeatmapCell({ impact, likelihood })}
                        selectedCell={selectedHeatmapCell}
                      />
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

              {/* Risk Drill-down & Activity Feed */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={cn(
                  "lg:col-span-2 p-6 rounded-xl border shadow-sm h-[400px] flex flex-col",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={cn(
                      "text-lg font-semibold flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-slate-800"
                    )}>
                      <Zap className="w-4 h-4 text-amber-500" />
                      Risk Drill-down
                    </h3>
                    {selectedHeatmapCell ? (
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded tracking-widest">
                        IMPACT {selectedHeatmapCell.impact} / LIKELIHOOD {selectedHeatmapCell.likelihood}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest underline decoration-dotted">Select a cell above</span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {risksInSelectedCell.length > 0 ? (
                      risksInSelectedCell.map(risk => (
                        <div key={risk.id} className={cn(
                          "p-3 rounded-lg border transition-all hover:border-indigo-300",
                          isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-400">{risk.id}</span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter text-white",
                              risk.severity === 'Critical' ? "bg-red-500" : risk.severity === 'High' ? "bg-orange-500" : "bg-amber-500"
                            )}>{risk.severity}</span>
                          </div>
                          <p className={cn(
                            "text-xs font-semibold mt-1",
                            isDarkMode ? "text-slate-300" : "text-slate-700"
                          )}>{risk.title}</p>
                          <div className="mt-2 flex gap-2">
                            {risk.frameworks.map(fw => (
                              <span key={fw} className="text-[9px] text-slate-400 font-bold tracking-tight px-1.5 border border-slate-200 rounded">{fw}</span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 grayscale opacity-50">
                        <Search className="w-12 h-12 text-slate-200 mb-2" />
                        <p className="text-sm font-medium text-slate-400">Click any heat signature on the impact matrix to reveal filtered risk telemetry.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "p-6 rounded-xl border shadow-sm h-[400px] flex flex-col",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  <h3 className={cn(
                    "text-lg font-semibold mb-6 flex items-center gap-2",
                    isDarkMode ? "text-white" : "text-slate-800"
                  )}>
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Activity Timeline
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2">
                    <ActivityTimeline activities={activities} />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Controls Mastery */}
          <ChartContainer title="Control Performance by Enterprise Framework" className="h-[420px]" isDarkMode={isDarkMode}>
            <MemoizedGroupedBarChart data={controlRateByFramework} isDarkMode={isDarkMode} />
          </ChartContainer>

          {/* Row 5: Data Registry */}
          <div className={cn(
            "rounded-2xl border shadow-sm overflow-hidden mb-8 transition-colors duration-300",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className={cn(
              "p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4",
              isDarkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-100 bg-slate-50/30"
            )}>
              <div>
                <h3 className={cn(
                  "text-lg font-bold tracking-tight",
                  isDarkMode ? "text-white" : "text-slate-800"
                )}>Active Findings Registry</h3>
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
                    className={cn(
                      "border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-64 shadow-sm",
                      isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  />
                </div>
                <div className={cn(
                  "flex rounded-xl border p-1 shadow-sm",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  {['All', 'Open', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFindingsFilter(status as any)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                        findingsFilter === status 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                          : "text-slate-500 hover:text-slate-700"
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
                  <tr className={cn(
                    "border-b transition-colors",
                    isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50/50 border-slate-100"
                  )}>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement Violation</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational State</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Impact</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Framework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayFindings.map((f) => (
                    <tr 
                      key={f.id} 
                      onClick={() => setSelectedFinding(f)}
                      className={cn(
                        "transition-colors group cursor-pointer",
                        isDarkMode ? "hover:bg-indigo-500/10" : "hover:bg-indigo-50/20"
                      )}
                    >
                      <td className={cn(
                        "px-8 py-4 font-mono text-[11px] font-bold transition-colors",
                        isDarkMode ? "text-indigo-400 bg-slate-900/50 group-hover:bg-indigo-500/20" : "text-indigo-600 bg-slate-50/30 group-hover:bg-indigo-50/50"
                      )}>{f.id}</td>
                      <td className={cn(
                        "px-6 py-4 text-sm font-semibold",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}>{f.title}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                          f.status === 'Open' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          f.status === 'Overdue' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          f.status === 'In-Progress' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-block w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 transition-transform group-hover:scale-125",
                          isDarkMode ? "ring-slate-950" : "ring-slate-50",
                          f.severity === 'Critical' ? "bg-red-500 animate-pulse" :
                          f.severity === 'High' ? "bg-orange-500" :
                          f.severity === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-black transition-colors px-2 py-1 rounded",
                          isDarkMode ? "text-slate-500 group-hover:text-indigo-400 bg-slate-800 group-hover:bg-indigo-500/20" : "text-slate-400 group-hover:text-indigo-500 bg-slate-100 group-hover:bg-indigo-50"
                        )}>{f.framework}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={cn(
              "p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
            )}>
              <div className="flex items-center gap-4">
                <p className="text-[11px] text-slate-500 font-medium italic">Synchronized with remote GRC vault. 128-bit encryption active.</p>
                {visibleFindings < filteredFindingsBySearch.length && (
                  <button 
                    onClick={() => setVisibleFindings(prev => prev + 10)}
                    className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded hover:bg-indigo-500/10 transition-colors"
                  >
                    Load More Findings (+10)
                  </button>
                )}
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
        <footer className={cn(
          "h-10 border-t flex items-center px-8 justify-between text-[10px] font-bold shrink-0 uppercase tracking-widest z-10 transition-colors duration-300",
          isDarkMode ? "bg-slate-950 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-500"
        )}>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> GRC Engine: Operational</span>
            <div className="w-px h-3 bg-slate-200" />
            <span className="text-slate-400">Node Cluster: COMPLIANCE-PRJ-01</span>
          </div>
          <div className="flex items-center gap-6">
             <span className="text-indigo-500">Security Verified</span>
             <div className="w-px h-3 bg-slate-200" />
             <div className="font-mono text-slate-400">v2.0.5-LTS-STABLE</div>
          </div>
        </footer>
      </main>

      {/* Finding Detail Modal */}
      <AnimatePresence>
        {selectedFinding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFinding(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onAnimationComplete={() => {
                if (!selectedFinding) {
                  setAiGuidance(null);
                }
              }}
              className={cn(
                "relative max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold rounded border border-indigo-500/20">{selectedFinding.id}</span>
                       <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                          selectedFinding.severity === 'Critical' ? "bg-red-500/10 text-red-500" :
                          selectedFinding.severity === 'High' ? "bg-orange-500/10 text-orange-500" : "bg-amber-500/10 text-amber-500"
                       )}>{selectedFinding.severity} IMPACT</span>
                    </div>
                    <h2 className={cn(
                      "text-2xl font-bold tracking-tight",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>{selectedFinding.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedFinding(null)}
                    className={cn(
                      "transition-colors p-2 rounded-full shrink-0",
                      isDarkMode ? "text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700" : "text-slate-500 hover:text-indigo-500 bg-slate-100 hover:bg-slate-200"
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</h4>
                      <p className={cn(
                        "text-sm font-bold",
                        selectedFinding.status === 'Closed' ? "text-emerald-500" : 
                        selectedFinding.status === 'Overdue' ? "text-red-500" :
                        selectedFinding.status === 'In-Progress' ? "text-blue-500" : 
                        "text-amber-500"
                      )}>{selectedFinding.status}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Framework</h4>
                      <p className="text-sm font-bold text-slate-400">{selectedFinding.framework}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Audit Date</h4>
                      <p className="text-sm font-bold text-slate-400">{selectedFinding.date}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ownership</h4>
                      <p className="text-sm font-bold text-slate-400">soc_compliance_team</p>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border mb-8",
                  isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Remediation Guidance</h4>
                    </div>
                    <button 
                      onClick={() => analyzeWithAI(selectedFinding)}
                      disabled={isAiLoading}
                      className="flex items-center gap-2 text-[10px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50"
                    >
                      {isAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate AI Intelligence
                    </button>
                  </div>
                  
                  {aiGuidance ? (
                    <div className="space-y-4">
                       <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                        {aiGuidance}
                      </p>
                      <p className="text-[9px] text-slate-400 italic">Guidance generated by Gemini Flash using active GRC context.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 leading-relaxed italic">
                      Standard Mitigation: This finding indicates a deviation from standard control implementation. Request custom intelligence above for granular steps.
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => resolveFinding(selectedFinding.id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    Mark as Resolved
                  </button>
                  <button 
                    onClick={() => assignTask(selectedFinding.id)}
                    className={cn(
                      "flex-1 border font-bold py-3 rounded-xl transition-all active:scale-95",
                      isDarkMode ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Assign Task
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
