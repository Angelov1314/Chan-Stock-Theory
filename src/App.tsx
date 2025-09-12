import { useState, useEffect } from 'react'
import './App.css'
import { 
  analyzeStock, 
  register, 
  login, 
  logout, 
  getCurrentUser,
  searchStocks,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getResearchHistory,
  deleteResearchHistory
} from './api'

// 用户类型定义
interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  last_login: string;
}

// 关注列表项类型
interface WatchlistItem {
  symbol: string;
  display_name: string;
  added_at: string;
}

// 研究历史项类型
interface HistoryItem {
  id: string;
  symbol: string;
  start_date: string;
  end_date: string;
  timeframe: string;
  analysis_data: any;
  chart_data: string;
  created_at: string;
}

function App() {
  // 基础状态
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // 用户状态
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // 表单状态
  const [formData, setFormData] = useState({
    symbol: 'AAPL',
    start_date: '',
    end_date: '',
    timeframe: '1d'
  });
  
  // 股票搜索状态
  const [stockSearchResults, setStockSearchResults] = useState<any[]>([]);
  const [showStockSearch, setShowStockSearch] = useState(false);
  
  // 关注列表状态
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  
  // 研究历史状态
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // 认证表单状态
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // 检查用户登录状态
    checkAuthStatus();
  }, []);

  // 检查认证状态
  const checkAuthStatus = async () => {
    try {
      const response = await getCurrentUser();
      if (response.data.success) {
        setUser(response.data.user);
        loadUserData();
      }
    } catch (error) {
      console.log('用户未登录');
    }
  };

  // 加载用户数据
  const loadUserData = async () => {
    try {
      const [watchlistRes, historyRes] = await Promise.all([
        getWatchlist(),
        getResearchHistory(20)
      ]);
      
      if (watchlistRes.data.success) {
        setWatchlist(watchlistRes.data.watchlist);
      }
      
      if (historyRes.data.success) {
        setHistory(historyRes.data.history);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  // 用户认证函数
  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await login({
        username: authForm.username,
        password: authForm.password
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setShowAuthModal(false);
        setAuthForm({ username: '', email: '', password: '', confirmPassword: '' });
        loadUserData();
        setStatus('登录成功 ✅');
      }
    } catch (error: any) {
      setStatus(`登录失败: ${error.response?.data?.error || '未知错误'} ❌`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (authForm.password !== authForm.confirmPassword) {
      setStatus('密码确认不匹配 ❌');
      return;
    }
    
    try {
      setLoading(true);
      const response = await register({
        username: authForm.username,
        email: authForm.email,
        password: authForm.password
      });
      
      if (response.data.success) {
        setStatus('注册成功，请登录 ✅');
        setAuthMode('login');
        setAuthForm({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error: any) {
      setStatus(`注册失败: ${error.response?.data?.error || '未知错误'} ❌`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setWatchlist([]);
      setHistory([]);
      setStatus('已登出 ✅');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 股票搜索函数
  const handleStockSearch = async (query: string) => {
    if (!query.trim()) {
      setStockSearchResults([]);
      return;
    }
    
    try {
      const response = await searchStocks({ query });
      if (response.data.success) {
        setStockSearchResults(response.data.results);
      }
    } catch (error) {
      console.error('股票搜索失败:', error);
    }
  };

  // 关注列表函数
  const handleAddToWatchlist = async (symbol: string, displayName?: string) => {
    try {
      const response = await addToWatchlist({ symbol, display_name: displayName });
      if (response.data.success) {
        loadUserData();
        setStatus('已添加到关注列表 ✅');
      }
    } catch (error: any) {
      setStatus(`添加失败: ${error.response?.data?.error || '未知错误'} ❌`);
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      const response = await removeFromWatchlist(symbol);
      if (response.data.success) {
        loadUserData();
        setStatus('已从关注列表移除 ✅');
      }
    } catch (error: any) {
      setStatus(`移除失败: ${error.response?.data?.error || '未知错误'} ❌`);
    }
  };

  // 历史记录函数
  const handleLoadHistory = async () => {
    try {
      const response = await getResearchHistory(50);
      if (response.data.success) {
        setHistory(response.data.history);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    try {
      const response = await deleteResearchHistory(historyId);
      if (response.data.success) {
        loadUserData();
        setStatus('历史记录已删除 ✅');
      }
    } catch (error: any) {
      setStatus(`删除失败: ${error.response?.data?.error || '未知错误'} ❌`);
    }
  };

  const handleLoadFromHistory = (historyItem: HistoryItem) => {
    setFormData({
      symbol: historyItem.symbol,
      start_date: historyItem.start_date,
      end_date: historyItem.end_date,
      timeframe: historyItem.timeframe
    });
    setShowHistory(false);
    setStatus('已加载历史记录 ✅');
  };

  const checkHealth = async () => {
    try {
      setLoading(true);
      await analyzeStock({ symbol: 'AAPL', start_date: '2024-01-01', end_date: '2024-01-02', timeframe: '1d' });
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
      const result = await analyzeStock(formData);
      setAnalysis(result.data);
      setStatus('Analysis Complete ✅');
      
      // 如果用户已登录，重新加载数据
      if (user) {
        loadUserData();
      }
    } catch (error: any) {
      setStatus(`Analysis Failed: ${error.response?.data?.error || '未知错误'} ❌`);
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📈 缠论技术分析系统</h1>
          <p>专业股票技术分析工具</p>
        </div>
        <div className="header-actions">
          {user ? (
            <div className="user-info">
              <span>欢迎, {user.username}</span>
              <button onClick={handleLogout} className="btn-secondary">登出</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn-primary">
              登录/注册
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* 状态显示 */}
        <section className="status-section">
          <div className="status-bar">
            <span>状态: {status}</span>
            <button onClick={checkHealth} disabled={loading} className="btn-small">
              {loading ? '检查中...' : '测试连接'}
            </button>
          </div>
        </section>

        {/* 快速操作栏 */}
        {user && (
          <section className="quick-actions">
            <button onClick={() => setShowWatchlist(!showWatchlist)} className="btn-outline">
              📋 关注列表 ({watchlist.length})
            </button>
            <button onClick={handleLoadHistory} className="btn-outline">
              📚 研究历史 ({history.length})
            </button>
          </section>
        )}

        {/* 关注列表 */}
        {showWatchlist && user && (
          <section className="watchlist-section">
            <h3>📋 关注列表</h3>
            <div className="watchlist-grid">
              {watchlist.map((item, index) => (
                <div key={index} className="watchlist-item">
                  <span className="symbol">{item.display_name}</span>
                  <div className="actions">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, symbol: item.symbol }))}
                      className="btn-small"
                    >
                      分析
                    </button>
                    <button 
                      onClick={() => handleRemoveFromWatchlist(item.symbol)}
                      className="btn-small btn-danger"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 研究历史 */}
        {showHistory && user && (
          <section className="history-section">
            <h3>📚 研究历史</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-info">
                    <span className="symbol">{item.symbol}</span>
                    <span className="period">{item.start_date} 至 {item.end_date}</span>
                    <span className="timeframe">{item.timeframe}</span>
                    <span className="date">{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  <div className="actions">
                    <button 
                      onClick={() => handleLoadFromHistory(item)}
                      className="btn-small"
                    >
                      加载
                    </button>
                    <button 
                      onClick={() => handleDeleteHistory(item.id)}
                      className="btn-small btn-danger"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 分析表单 */}
        <section className="form-section">
          <h2>股票分析</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>股票代码:</label>
              <div className="input-with-search">
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, symbol: e.target.value }));
                    handleStockSearch(e.target.value);
                  }}
                  placeholder="例如: AAPL, 000001, 贵州茅台"
                  onFocus={() => setShowStockSearch(true)}
                />
                {showStockSearch && stockSearchResults.length > 0 && (
                  <div className="search-results">
                    {stockSearchResults.map((result, index) => (
                      <div 
                        key={index} 
                        className="search-result-item"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, symbol: result.symbol }));
                          setShowStockSearch(false);
                        }}
                      >
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {user && (
                <button 
                  onClick={() => handleAddToWatchlist(formData.symbol)}
                  className="btn-small btn-outline"
                >
                  + 添加到关注列表
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label>时间框架:</label>
              <select
                value={formData.timeframe}
                onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
              >
                <option value="1m">1分钟</option>
                <option value="5m">5分钟</option>
                <option value="15m">15分钟</option>
                <option value="30m">30分钟</option>
                <option value="1h">1小时</option>
                <option value="1d">日线</option>
                <option value="1wk">周线</option>
                <option value="1mo">月线</option>
              </select>
            </div>

            <div className="form-group">
              <label>开始日期:</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>结束日期:</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <button onClick={runAnalysis} disabled={loading} className="analyze-btn">
            {loading ? '分析中...' : '开始分析'}
          </button>
        </section>

        {/* 分析结果 */}
        {analysis && (
          <section className="results-section">
            <h2>分析结果</h2>
            {analysis.chart && (
              <div className="chart-container">
                <img src={analysis.chart} alt="缠论分析图表" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
            {analysis.report && (
              <div className="report-container">
                <h3>分析报告</h3>
                <pre>{JSON.stringify(analysis.report, null, 2)}</pre>
              </div>
            )}
          </section>
        )}
      </main>

      {/* 认证模态框 */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{authMode === 'login' ? '登录' : '注册'}</h3>
            
            <div className="form-group">
              <label>用户名:</label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="请输入用户名"
              />
            </div>
            
            {authMode === 'register' && (
              <div className="form-group">
                <label>邮箱:</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="请输入邮箱"
                />
              </div>
            )}
            
            <div className="form-group">
              <label>密码:</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="请输入密码"
              />
            </div>
            
            {authMode === 'register' && (
              <div className="form-group">
                <label>确认密码:</label>
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="请再次输入密码"
                />
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '处理中...' : (authMode === 'login' ? '登录' : '注册')}
              </button>
              
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="btn-outline"
              >
                {authMode === 'login' ? '切换到注册' : '切换到登录'}
              </button>
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Powered by Flask API + React + Capacitor</p>
      </footer>
    </div>
  )
}

export default App