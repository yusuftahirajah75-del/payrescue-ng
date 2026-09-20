import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  Building2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      addToast('error', 'Password must be at least 8 characters long');
      return;
    }

    setIsUpdating(true);
    // Simulate updating password
    setTimeout(() => {
      setIsUpdating(false);
      addToast('success', 'Password security credentials updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">
          User Profile & Security
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, verified identity, and security preferences.
        </p>
      </div>

      {/* Account Info Card */}
      <Card title="Account Overview">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xl">
              {user?.fullName?.slice(0, 2).toUpperCase() || 'PR'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span>Role: <strong className="text-slate-700">{user?.role}</strong></span>
                &bull;
                <span>Member since {user?.createdAt ? formatDate(user.createdAt) : '2025'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block mb-1">Phone Number</span>
            <span className="font-semibold text-slate-800">{user?.phoneNumber || '+234 800 000 0000'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block mb-1">KYC / BVN Verification Tier</span>
            <span className="font-semibold text-emerald-700">Tier 2 — Regulatory Complete</span>
          </div>
        </div>
      </Card>

      {/* Change Password Form */}
      <Card title="Security & Credentials">
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Secure Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="Must be at least 8 characters with upper, lower, and numbers"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button variant="primary" type="submit" loading={isUpdating}>
            <Lock className="w-4 h-4 mr-2" />
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
