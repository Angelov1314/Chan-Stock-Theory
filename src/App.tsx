import { useState, useEffect } from 'react'
import './App.css'

// Simple API client (no axios dependency needed)
const API_BASE = 'https://chan-stock-theory.onrender.com';

const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE}${url}`);
    return response.json();
  },
  post: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};

function App() {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [formData, setFormData] = useState({
    symbol: 'AAPL',
    start_date: '',
    end_date: '',
    timeframe: '1d'
  });

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    setFormData(prev => ({
      ...prev,
      start_date: oneYearAgo.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    }));
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const result = await api.get('/');
      setStatus('API Connected ✅');
    } catch (error) {
      setStatus('API Error ❌');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setLoading(true);
      const result = await api.post('/analyze', formData);
      setAnalysis(result);
      setStatus('Analysis Complete ✅');
    } catch (error) {
      setStatus('Analysis Failed ❌');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📈 Chan Theory Analysis</h1>
        <p>Mobile App - Connected to Flask Backend</p>
      </header>

      <main className="app-main">
        {/* API Status */}
        <section className="status-section">
          <h2>API Status</h2>
          <p>Status: {status}</p>
          <button onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Test API Connection'}
          </button>
        </section>

        {/* Analysis Form */}
        <section className="form-section">
          <h2>Stock Analysis</h2>
          <div className="form-group">
            <label>Stock Symbol:</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              placeholder="e.g., AAPL"
            />
          </div>
          
          <div className="form-group">
            <label>Timeframe:</label>
            <select
              value={formData.timeframe}
              onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
            >
              <option value="1d">Daily</option>
              <option value="1wk">Weekly</option>
              <option value="1mo">Monthly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>

          <button onClick={runAnalysis} disabled={loading} className="analyze-btn">
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </section>

        {/* Results */}
        {analysis && (
          <section className="results-section">
            <h2>Analysis Results</h2>
            {analysis.chart && (
              <div className="chart-container">
                <img src={analysis.chart} alt="Chan Theory Chart" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
            {analysis.report && (
              <div className="report-container">
                <h3>Report</h3>
                <pre>{JSON.stringify(analysis.report, null, 2)}</pre>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Flask API + React + Capacitor</p>
      </footer>
    </div>
  )
}

export default App