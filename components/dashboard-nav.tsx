
import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard/overview', icon: 'home' },
  { name: 'QA Benchmark', path: '/dashboard/qa', icon: 'clipboard-check' },
  { name: 'Reports', path: '/dashboard/reports', icon: 'bar-chart-2' },
  { name: 'AI Feedback', path: '/dashboard/feedback', icon: 'sparkles' },
  { name: 'SQL Editor', path: '/dashboard/sql', icon: 'terminal' },
  { name: 'Settings', path: '/dashboard/settings', icon: 'settings' },
];

const NavItem: React.FC<{ item: typeof navItems[0]; onClick?: () => void }> = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground dark:bg-dark-primary dark:text-dark-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`
    }
  >
    <i data-lucide={item.icon} className="w-5 h-5 mr-3"></i>
    {item.name}
  </NavLink>
);

interface DashboardNavProps {
    isMobile: boolean;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [location.pathname, sidebarOpen]);
    
    const navContent = (
        <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-4 border-b shrink-0 border-border dark:border-dark-border">
                <i data-lucide="shield-check" className="w-8 h-8 text-indigo-600"></i>
                <span className="ml-2 text-xl font-bold">QA Pro</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map(item => <NavItem key={item.path} item={item} onClick={() => setSidebarOpen(false)} />)}
            </nav>
            <div className="px-2 py-4 mt-auto border-t border-border dark:border-dark-border">
                <button className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <i data-lucide="life-buoy" className="w-5 h-5 mr-3"></i>
                    Help & Support
                </button>
            </div>
        </div>
    );

  if (isMobile) {
    return (
      <>
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-dark-card border-r border-border dark:border-dark-border transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {navContent}
        </div>
      </>
    );
  }

  return (
    <div className="hidden w-64 border-r md:block bg-white dark:bg-dark-card border-border dark:border-dark-border">
        {navContent}
    </div>
  );
};

export default DashboardNav;
