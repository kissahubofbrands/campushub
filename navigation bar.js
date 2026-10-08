import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 text-white p-2 rounded-xl">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">CAMPUSHUB</span>
          <span className="hidden sm:inline-block ml-2 text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
            {user.role}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-700">
          <User className="w-4 h-4 text-slate-400" />
          <span>{user.fullName}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </nav>
  );
}