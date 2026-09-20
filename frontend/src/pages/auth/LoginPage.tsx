import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resUser = await login({ email, password });
      toast.success('Welcome Back', 'Authenticated successfully.');

      if (from) {
        navigate(from, { replace: true });
      } else if (resUser?.role === 'SUPER_ADMIN' || resUser?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (resUser?.role === 'BUSINESS_OWNER' || resUser?.role === 'BUSINESS_ADMIN' || resUser?.role === 'BUSINESS_AGENT') {
        navigate('/business', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error('Authentication Failed', err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display text-slate-900">
            PAYRESCUE <span className="text-xs px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">NG</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold font-display text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">
          Track transaction recovery cases, manage evidence dossiers, or access payment reconciliation.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 shadow-xl border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="chidi.okafor@example.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              size="md"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill Pill for Evaluators */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick Evaluator Credentials:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('chidi.okafor@example.ng');
                  setPassword('PayRescue2026!');
                }}
                className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Fill Consumer Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('amina.merchant@lagosretail.ng');
                  setPassword('PayRescue2026!');
                }}
                className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Fill Merchant Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@payrescue.ng');
                  setPassword('PayRescue2026!');
                }}
                className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Fill Admin Demo
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
