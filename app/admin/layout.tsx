'use client';
// app/admin/layout.tsx
// Admin panel layout with sidebar, top header, and auth check

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderTree, FileText, MessageSquare,
  BarChart2, Settings, LogOut, Menu, X, Terminal,
  Activity, Globe, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/content',    label: 'Content',      icon: FolderTree },
  { href: '/admin/files',      label: 'Files',        icon: FileText },
  { href: '/admin/messages',   label: 'Messages',     icon: MessageSquare },
  { href: '/admin/analytics',  label: 'Analytics',    icon: BarChart2 },
  { href: '/admin/activity',   label: 'Activity Log', icon: Activity },
  { href: '/admin/settings',   label: 'Settings',     icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const Sidebar = (
    <aside
      className={`admin-sidebar flex flex-col h-full transition-all duration-300 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-border ${!sidebarOpen && 'justify-center'}`}>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Terminal size={16} className="text-primary" />
        </div>
        {sidebarOpen && (
          <div>
            <div className="text-sm font-heading font-bold text-text-primary">Portfolio</div>
            <div className="text-xs text-text-muted">CMS Admin</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 overflow-y-auto" role="navigation">
        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            const hasNotif = label === 'Messages' && unreadMessages > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`admin-nav-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{label}</span>
                      {hasNotif && (
                        <span className="bg-error text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {unreadMessages}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="text-primary opacity-50" />}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: portfolio link + logout */}
      <div className="p-2 border-t border-border space-y-1">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`admin-nav-item ${!sidebarOpen ? 'justify-center px-2' : ''}`}
          title={!sidebarOpen ? 'View Portfolio' : undefined}
        >
          <Globe size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>View Portfolio</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`admin-nav-item w-full text-error hover:bg-error/10 ${!sidebarOpen ? 'justify-center px-2' : ''}`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-bg overflow-hidden" role="application">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col">
        {Sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col"
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-surface border-b border-border px-4 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted
                         hover:text-text-primary hover:bg-surface-2 transition-colors lg:flex"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen && isMobile ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Breadcrumb */}
            <div className="text-sm text-text-muted font-mono hidden sm:block">
              admin /
              <span className="text-text-primary ml-1">
                {pathname.split('/').pop() || 'dashboard'}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-text-muted hidden sm:block">
              Welcome back, <span className="text-primary font-medium">{adminName}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {adminName.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" id="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
