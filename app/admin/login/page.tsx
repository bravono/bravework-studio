'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would validate credentials against your backend
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // Set admin session/token with 24-hour expiry
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminAuthExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <main>
      <Navbar />
      <section className="admin-login-section">
        <div className="container">
          <div className="admin-login-container">
            <h1>Admin Login</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="admin-login-btn">
                Login
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
} 