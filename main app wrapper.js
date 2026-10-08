import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Navbar from './components/Navbar';
import CampusAIChat from './components/CampusAIChat';

export default function App() {
  const { user } = useContext(AuthContext);

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <main>
        {user.role === 'STUDENT' && <StudentDashboard />}
        {user.role === 'FACULTY' && <FacultyDashboard />}
        {(user.role === 'SUPER_ADMIN' || user.role === 'DEPT_ADMIN') && <SuperAdminDashboard />}
      </main>
      <CampusAIChat />
    </div>
  );
}