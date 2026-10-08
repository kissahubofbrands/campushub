import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('student@campushub.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Unable to communicate with API server.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-100 rounded-2xl text-indigo-600">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">CAMPUSHUB</h1>
          <p className="text-xs font-bold text-slate-400 tracking-wider">ONE COLLEGE. ONE PLATFORM. ZERO CONFUSION.</p>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
            Sign In
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Demo Role Switcher:</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => { setEmail('student@campushub.edu'); setPassword('password123'); }} className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Student</button>
            <button onClick={() => { setEmail('faculty@campushub.edu'); setPassword('password123'); }} className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Faculty</button>
            <button onClick={() => { setEmail('admin@campushub.edu'); setPassword('password123'); }} className="px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}