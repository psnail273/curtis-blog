'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { invalidateAdminStatus } from '@/lib/hooks/use-admin-status';
import { LoginGate } from './components/LoginGate';
import { ArticlesManager } from './components/ArticlesManager';
import { AboutManager } from './components/AboutManager';
import { FilesManager } from './components/FilesManager';

type Tab = 'articles' | 'about' | 'files';

export function AdminPageContent() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('articles');

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        setAuthenticated(data.authenticated === true);
      } catch {
        setAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // Clear local state even if the request fails
    }
    invalidateAdminStatus(false);
    setAuthenticated(false);
  }

  // Loading state while checking session
  if (authenticated === null) {
    return (
      <div className="max-w-5xl mx-auto pb-16">
        <p className="text-muted py-16 text-center">Checking session...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authenticated) {
    return <LoginGate onLogin={() => {
      invalidateAdminStatus(true);
      setAuthenticated(true);
    }} />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <header className="mb-8">
        <div className="w-12 h-1 rounded-full mb-6 bg-accent" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Admin</h1>
            <p className="text-muted">Manage articles, about page content, and files.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-accent/5 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="flex gap-1 mb-8 border-b border-border" aria-label="Admin sections">
        {(['articles', 'about', 'files'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors relative capitalize',
              activeTab === tab
                ? 'text-accent'
                : 'text-muted hover:text-foreground'
            )}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      {activeTab === 'articles' && <ArticlesManager />}
      {activeTab === 'about' && <AboutManager />}
      {activeTab === 'files' && <FilesManager />}
    </div>
  );
}
