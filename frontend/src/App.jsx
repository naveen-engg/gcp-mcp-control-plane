import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const tabs = [
    { name: 'Admin Fleet', path: '/' },
    { name: 'Deployments', path: '/deploy' },
    { name: 'Metrics', path: '/metrics' },
  ];

  return (
    <div className="w-64 glass-panel max-h-[96vh] m-4 flex flex-col p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="text-xl font-semibold tracking-wide">MCP Portal</span>
      </div>
      <nav className="flex flex-col gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`px-4 py-3 rounded-lg transition-all ${
              location.pathname === tab.path
                ? 'bg-brand-primary/20 text-brand-primary font-medium border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-2">
        <div className="text-sm text-slate-500 font-light flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> System Healthy
        </div>
      </div>
    </div>
  );
}

function AdminFleet() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://platform-orchestrator-api-668628440470.us-central1.run.app/fleet')
      .then(res => res.json())
      .then(data => {
        setDeployments(data.deployments || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch fleet data", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
        Global Fleet Overview
      </h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Active LOB Servers', value: loading ? '...' : deployments.length.toString() },
          { label: 'Avg Latency', value: '45ms' },
          { label: 'Monthly Cost (Est)', value: '$342.10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 flex flex-col gap-2">
            <span className="text-slate-400 font-medium text-sm">{stat.label}</span>
            <span className="text-4xl font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/20 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Running Clusters</h2>
          <button onClick={() => window.location.reload()} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white">Refresh</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-800/40 text-slate-400 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Team</th>
              <th className="px-6 py-4 font-medium">Domain</th>
              <th className="px-6 py-4 font-medium">Uptime</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {deployments.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No active LOB clusters detected.</td>
              </tr>
            )}
            {deployments.map((dep, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4">{dep.team}</td>
                <td className="px-6 py-4 text-blue-400 font-mono text-sm">{dep.domain}</td>
                <td className="px-6 py-4 text-slate-300">{dep.uptime}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${dep.status === 'Building' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {dep.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LOBDeployment() {
  const [projectId, setProjectId] = useState('');
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [logs, setLogs] = useState(['system &gt; Waiting for deployment trigger...']);

  const handleDeploy = async () => {
    if (!projectId) return alert('GCP Project ID is required');
    setIsLoading(true);
    setLogs(['system > Initiating deployment to ' + projectId + '...']);
    
    try {
      const resp = await fetch('https://platform-orchestrator-api-668628440470.us-central1.run.app/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, github_repo: repo })
      });
      const data = await resp.json();
      
      if (resp.ok) {
        setDeployResult(data);
        const trace = data.execution_trace ? data.execution_trace.map(l => 'system > ' + l) : [];
        setLogs(prev => [
            ...prev, 
            ...trace,
            'system > Service mapped to ' + data.service_url
        ]);
      } else {
        setLogs(prev => [...prev, 'error > ' + (data.detail || 'Failed deployment.')]);
      }
    } catch(err) {
      setLogs(prev => [...prev, 'error > Could not reach orchestrator. Is the backend running?']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Deploy MCP Server</h1>
      
      <div className="grid grid-cols-[1fr_400px] gap-8">
        <div className="glass-panel p-8 space-y-6 form-control">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">GCP Project ID</label>
            <input 
              type="text" 
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="my-team-project-123"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">GitHub Repository</label>
            <input 
              type="text" 
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="org/repo-name"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            />
          </div>
          <button 
            onClick={handleDeploy} 
            disabled={isLoading} 
            className="btn-primary w-full py-3 mt-4 text-lg disabled:opacity-50 relative overflow-hidden"
          >
            {isLoading ? 'Deploying...' : 'Register & Deploy'}
            {isLoading && (
              <div className="absolute bottom-0 left-0 h-1 bg-white/50 animate-[shimmer_2s_infinite] w-full" style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
              }}></div>
            )}
          </button>

          <div className="mt-8 pt-8 border-t border-slate-700/50">
             <h3 className="text-lg font-semibold mb-4">Claude Desktop Config</h3>
             <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 overflow-x-auto border border-slate-700">
               <pre>{`{
  "mcpServers": {
    "enterprise": {
      "command": "npx",
      "args": [
        "-y",
        "@googlecloud/auth-proxy",
        "${deployResult ? deployResult.service_url : ('https://' + (projectId || 'team') + '.mcp.enterprise.com')}"
      ]
    }
  }
}`}</pre>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
           <div className="glass-panel p-4 flex-1 flex flex-col font-mono text-xs">
             <div className="text-slate-500 mb-2 uppercase tracking-wide text-[10px] font-bold">Build Logs</div>
             <div className="flex-1 bg-black/40 rounded border border-slate-800 p-3 text-slate-300 overflow-y-auto space-y-2">
               {logs.map((log, i) => (
                 <div key={i} className={log.startsWith('error') ? 'text-red-400' : 'text-blue-400'}>{log}</div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen w-full bg-[#0a0f1c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black overflow-hidden relative">
        {/* Decorative background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <Sidebar />
        <Routes>
          <Route path="/" element={<AdminFleet />} />
          <Route path="/deploy" element={<LOBDeployment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
