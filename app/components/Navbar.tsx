'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const checkAuth = () => {
      const clientToken = localStorage.getItem('clientAuth');
      const adminAuth = localStorage.getItem('adminAuth');
      const adminExpiry = localStorage.getItem('adminAuthExpiry');
      
      setIsClientAuthenticated(!!clientToken);
      
      if (adminAuth && adminExpiry) {
        const expiryTime = parseInt(adminExpiry);
        setIsAdminAuthenticated(Date.now() < expiryTime);
      } else {
        setIsAdminAuthenticated(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    checkAuth();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (isAdminAuthenticated) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthExpiry');
      setIsAdminAuthenticated(false);
    } else {
      localStorage.removeItem('clientAuth');
      setIsClientAuthenticated(false);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          Bravework Studio
        </Link>

        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link 
              href="/" 
              className={pathname === '/' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          
          <li>
            <Link 
              href="/training" 
              className={pathname === '/training' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Training
            </Link>
          </li>
          <li>
            <Link 
              href="/portfolio" 
              className={pathname === '/portfolio' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link 
              href="/contact" 
              className={pathname === '/contact' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
          {isAdminAuthenticated ? (
            <>
              <li>
                <Link 
                  href="/admin/dashboard" 
                  className={pathname === '/admin/dashboard' ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="logout-button"
                >
                  Admin Logout
                </button>
              </li>
            </>
          ) : isClientAuthenticated ? (
            <>
              <li>
                <Link 
                  href="/dashboard" 
                  className={pathname === '/dashboard' ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className={pathname === '/profile' ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="logout-button"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {!isClientAuthenticated && <li>
                <Link 
                  href="/auth/login" 
                  className={pathname === '/auth/login' ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login/SignUp
                </Link>
              </li>}
              <li>
                <Link 
                  href="/admin/login" 
                  className={pathname === '/admin/login' ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
} 