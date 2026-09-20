import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, User as UserIcon, Phone, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const RegisterPage: React.FC = () => {
  const [accountType, setAccountType] = useState<'consumer' | 'business'>('consumer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: accountType === 'business' ? 'BUSINESS_OWNER' : 'USER',
        businessName: accountType === 'business' ? businessName : undefined,
      });

      toast.success('Account Created', 'Welcome to PayRescue NG!');
      navigate(accountType === 'business' ? '/business' : '/dashboard');
    } catch (err: any) {
      toast.error('Registration Failed', err.message || 'Could not complete registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display text-slate-900">PAYRESCUE NG</span>
        </Link>
        <h2 className="text-xl font-bold font-display text-slate-900">Create your PayRescue account</h2>
        <p className="text-xs text-slate-500">
          Independent transaction recovery assistance & multi-tenant merchant infrastructure.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 shadow-xl border-slate-200/80">
          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType('consumer')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                accountType === 'consumer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Consumer Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                accountType === 'business'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Business / Merchant
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="Chidi"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="Okafor"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {accountType === 'business' && (
              <Input
                label="Registered Business Name"
                placeholder="Okafor Logistics Limited"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="chidi.okafor@example.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Mobile Number (Nigeria)"
              type="tel"
              placeholder="08031234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="E.164 format: +23480..."
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="brand"
              size="md"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              {accountType === 'business' ? 'Create Business Account' : 'Register Free Account'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In production calls authApi.forgotPassword
      setIsSent(true);
      toast.success('Dispatched', 'If this email exists in our records, reset instructions have been sent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <h2 className="text-xl font-bold font-display text-slate-900">Reset your password</h2>
        <p className="text-xs text-slate-500">Enter your registered email address to receive reset instructions.</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 shadow-xl">
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600">
                A password reset token has been dispatched to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="inline-block text-xs font-bold text-brand-600 hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
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
              <Button type="submit" variant="brand" size="md" isLoading={isSubmitting} className="w-full">
                Send Reset Instructions
              </Button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-medium text-slate-500 hover:text-slate-800">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
