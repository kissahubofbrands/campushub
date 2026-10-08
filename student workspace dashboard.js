import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, MapPin, UserCheck, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [odForm, setOdForm] = useState({ eventName: '', organization: '', date: '2026-10-12', venue: '', documentName: 'invitation.pdf' });
  const [odStatus, setOdStatus] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [token]);

  const handleODSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/od/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(odForm)
    });
    const result = await res.json();
    setOdStatus(result.od);
  };

  if (!data) return <div className="p-8 text-center text-slate-500">Loading Student Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good Morning, {user.fullName} 👋</h1>
          <p className="text-indigo-200 text-sm">Register No: {user.registerNo} • Computer Science & Engineering</p>
        </div>
        <div className="bg-indigo-900/60 backdrop-blur-md border border-indigo-400/30 px-4 py-2 rounded-xl text-right">
          <p className="text-xs text-indigo-300">Academic Calendar Date</p>
          <p className="text-sm font-semibold">Thursday, October 8, 2026</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto space-x-6 text-sm font-medium">
        {['overview', 'od_portal'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition ${
              activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Current & Next Schedule
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                🟢 Live Hour
              </span>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Current Hour (10:00 - 10:50 AM)</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Database Management Systems</h3>
                <p className="text-sm text-slate-600">Faculty: Dr. Kumar</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 text-sm font-bold text-indigo-900 shadow-xs">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Room: Block A – 204
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-2">✓ Marked Present</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" /> Monthly Summary
            </h2>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <span className="text-4xl font-extrabold text-indigo-600">{data.stats.percentage}%</span>
              <p className="text-xs text-slate-500 mt-1">Overall Attendance</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'od_portal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Submit On-Duty (OD) Request
            </h2>
            <form onSubmit={handleODSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={odForm.eventName}
                  onChange={(e) => setOdForm({ ...odForm, eventName: e.target.value })}
                  placeholder="e.g. Hackathon 2026"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Organization</label>
                  <input
                    type="text"
                    required
                    value={odForm.organization}
                    onChange={(e) => setOdForm({ ...odForm, organization: e.target.value })}
                    placeholder="e.g. Anna University"
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={odForm.date}
                    onChange={(e) => setOdForm({ ...odForm, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition"
              >
                Submit with AI Verification
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-600" /> AI Verification Output
            </h2>
            {odStatus ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono whitespace-pre-line text-slate-800">
                  {odStatus.aiVerification}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                Submit an OD request to execute the document verification engine.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}