
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../firebase/useUser';
import { logout } from '../firebase/auth';
import { toast } from './ui/Toaster';

const DashboardHeader: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error: any) {
      toast(error.message, 'error');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b shrink-0 border-border dark:bg-dark-card dark:border-dark-border md:px-6">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-md md:hidden text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <i data-lucide="menu" className="w-6 h-6"></i>
        <span className="sr-only">Open sidebar</span>
      </button>
      <div className="items-center hidden gap-4 md:flex">
        {/* Placeholder for breadcrumbs or page title */}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-200 rounded-full dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-bold">
              {getInitials(userProfile?.name)}
            </div>
            <div className="hidden text-left md:block">
              <div className="font-semibold">{userProfile?.name}</div>
              <div className="text-xs text-muted-foreground">{userProfile?.email}</div>
            </div>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-dark-card dark:ring-dark-border">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                <a href="#/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Profile</a>
                <a href="#/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Settings</a>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
