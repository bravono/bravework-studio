'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/auth/login';

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="logo">
            Bravework Studio
          </Link>
          <div className="auth-tabs">
            <Link 
              href="/auth/login" 
              className={`auth-tab ${isLoginPage ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className={`auth-tab ${!isLoginPage ? 'active' : ''}`}
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div className="auth-content">
          {children}
        </div>
      </div>
    </div>
  );
} 