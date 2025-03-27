'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      const authExpiry = localStorage.getItem('adminAuthExpiry');
      
      if (auth && authExpiry) {
        const expiryTime = parseInt(authExpiry);
        if (Date.now() < expiryTime) {
          setIsAuthenticated(true);
        } else {
          // Clear expired auth
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminAuthExpiry');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthExpiry');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <Link 
            href="/admin/dashboard" 
            className={`admin-nav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/orders" 
            className={`admin-nav-item ${pathname === '/admin/orders' ? 'active' : ''}`}
          >
            Orders
          </Link>
          <Link 
            href="/admin/coupons" 
            className={`admin-nav-item ${pathname === '/admin/coupons' ? 'active' : ''}`}
          >
            Coupons
          </Link>
          <Link 
            href="/admin/services" 
            className={`admin-nav-item ${pathname === '/admin/services' ? 'active' : ''}`}
          >
            Services
          </Link>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
} 