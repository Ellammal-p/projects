import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LandingHome } from './pages/LandingHome';
import { Dashboard } from './pages/Dashboard';
import { Screening } from './pages/Screening';
import { ScreeningResult } from './pages/ScreeningResult';
import { HistoryPage } from './pages/History';
import { MoodTracker } from './pages/MoodTracker';
import { Journal } from './pages/Journal';
import { ModelBenchmarks } from './pages/ModelBenchmarks';
import { SupportPage } from './pages/SupportPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center text-slate-400 text-sm">
        Loading MindWell AI session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Layout Wrapper for Public Pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Landing Home Page */}
      <Route
        path="/home"
        element={
          <PublicLayout>
            <LandingHome />
          </PublicLayout>
        }
      />
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingHome />
          </PublicLayout>
        }
      />

      {/* Application Features */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/screening"
        element={
          <ProtectedRoute>
            <Screening />
          </ProtectedRoute>
        }
      />
      <Route
        path="/screening/result/:id"
        element={
          <ProtectedRoute>
            <ScreeningResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mood"
        element={
          <ProtectedRoute>
            <MoodTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/journal"
        element={
          <ProtectedRoute>
            <Journal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <ModelBenchmarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/models"
        element={
          <ProtectedRoute>
            <ModelBenchmarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <PublicLayout>
            <SupportPage />
          </PublicLayout>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
