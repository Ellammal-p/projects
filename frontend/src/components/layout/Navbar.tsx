import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brain, LogOut, User as UserIcon, AlertTriangle, PhoneCall } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Assessment', path: '/screening' },
    { name: 'Mood Tracker', path: '/mood' },
    { name: 'Journal', path: '/journal' },
    { name: 'AI Analysis', path: '/analysis' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Support', path: '/support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#111827] border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* MindWell AI Brand */}
          <Link to="/home" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl text-white tracking-tight">
                  MindWell <span className="text-cyan-400">AI</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider block -mt-1 uppercase font-medium">
                DeepLearn-Mind Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* SOS Crisis Button */}
            <Link
              to="/support"
              className="flex items-center space-x-1.5 bg-rose-600/20 border border-rose-500/50 hover:bg-rose-600 hover:border-rose-600 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm animate-pulse hover:animate-none"
              title="Immediate Crisis Assistance"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS Crisis</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  Login
                </Link>
                <Link
                  to="/screening"
                  className="text-xs bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-md shadow-cyan-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
