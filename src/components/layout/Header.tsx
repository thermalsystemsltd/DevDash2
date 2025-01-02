import React from 'react';
import { Menu, Bell, User, LogOut, Sun, Moon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import type { RootState } from '../../store/store';
import { authApi } from '../../services/api';
import { logOut } from '../../store/slices/authSlice';
import { useSidebarStore } from '../../store/sidebarStore';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const user = useSelector((state: RootState) => state.auth.user);
  const { isOpen, toggle } = useSidebarStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      // Clear all storage and reload the page to ensure clean state
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, we should still clear local state
      dispatch(logOut());
      window.location.href = '/login';
    } finally {
      // No need for navigate here since we're doing a full page reload
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center relative">
          <div className="flex items-center">
            <button 
              onClick={toggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="ml-4 flex items-center">
              <img 
                src="/public/ts1-logo.png" 
                alt="TS1 Logo" 
                className="h-8 w-8 mr-2"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  TS1
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    Monitoring System
                  </span>
                </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{user?.companyName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleThemeToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:block">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="mr-3 text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.roles.join(', ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:block">
                  <User className="h-6 w-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Sign Out"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}