import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Menu, X, ArrowRight, Activity, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-1.5">
                PAYRESCUE <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">NG</span>
              </span>
              <span className="block text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5">Dispute & Reconciliation</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#providers" className="hover:text-brand-600 transition-colors">Banks & Telcos</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
            <Link to="/status" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Status
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')}
                icon={<UserCheck className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => navigate('/where-is-my-money')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Rescue Case
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Features
          </a>
          <a
            href="#providers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Supported Providers
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Pricing
          </a>
          <Link
            to="/status"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-emerald-700"
          >
            <Activity className="w-4 h-4" />
            Infrastructure Status
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="brand"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/where-is-my-money');
                  }}
                >
                  Start Rescue Case
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
