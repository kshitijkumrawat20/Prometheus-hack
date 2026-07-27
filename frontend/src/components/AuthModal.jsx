import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await loginUser(username, password);
      } else {
        res = await registerUser(username, email, password);
      }
      
      const { token, user_id, username: uName } = res.data;
      localStorage.setItem('masterymap_token', token);
      localStorage.setItem('masterymap_user', JSON.stringify({ user_id, username: uName }));
      
      onAuthSuccess({ user_id, username: uName, token });
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0d10]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#13151a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6 relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg p-1.5 transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#da6b38] flex items-center justify-center text-white font-bold mx-auto shadow-md shadow-[#da6b38]/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white font-heading tracking-tight">
            {isLogin ? 'Sign In to MasteryMap' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            {isLogin ? 'Enter credentials to access course roadmaps & AI tutor sessions' : 'Register to store your BKT progress and study guides'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0c0d10] rounded-xl p-1 border border-zinc-800 font-heading text-xs font-semibold">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isLogin ? 'bg-[#da6b38] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isLogin ? 'bg-[#da6b38] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_student"
              className="w-full bg-[#0c0d10] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#da6b38] text-xs font-mono transition-all"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-[#0c0d10] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#da6b38] text-xs font-mono transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0c0d10] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#da6b38] text-xs font-mono transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 btn-primary rounded-xl font-bold text-xs transition-all duration-200 font-heading flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Authenticating...
              </span>
            ) : (
              <span>{isLogin ? 'Sign In to Workspace' : 'Create Student Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
