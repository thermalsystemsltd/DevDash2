import React, { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import DashboardPage from './pages/DashboardPage';
import ZonesPage from './pages/ZonesPage';
import BaseUnitsPage from './pages/BaseUnitsPage';
import SensorsPage from './pages/SensorsPage';
import AlarmsPage from './pages/AlarmsPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import PrivateRoute from './components/PrivateRoute';
import type { RootState } from './store/store';
import { restoreAuth } from './store/slices/authSlice';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  
  // Restore auth state before any rendering
  useLayoutEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);
  
  useAuth(); // Hook for token verification

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Add mobile menu state */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/sensors" element={<SensorsPage />} />
                    <Route path="/alarms" element={<AlarmsPage />} />
                    <Route path="/base-units" element={<BaseUnitsPage />} />
                    <Route path="/zones" element={<ZonesPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    {/* Other routes will be added as we develop more features */}
                  </Routes>
                </main>
              </div>
              <Footer />
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;