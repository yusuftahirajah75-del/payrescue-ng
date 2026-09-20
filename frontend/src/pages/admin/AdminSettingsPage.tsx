import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  CheckCircle2, 
  Settings2,
  Sparkles
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: settings = [], isLoading: isSettingsLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.listSettings(),
  });

  const { data: featureFlags = [], isLoading: isFlagsLoading } = useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: () => adminApi.listFeatureFlags(),
  });

  const flagMutation = useMutation({
    mutationFn: ({ name, isEnabled }: { name: string; isEnabled: boolean }) =>
      adminApi.updateFeatureFlag(name, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      addToast('success', 'Feature flag state toggled');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to toggle flag');
    }
  });

  const settingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      addToast('success', 'Setting value saved');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update setting');
    }
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">
          Platform Governance & Feature Flags
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure runtime parameters, statutory SLA thresholds, and live feature rollouts.
        </p>
      </div>

      {/* Feature Flags Card */}
      <Card title="Operational Feature Flags">
        <div className="space-y-4">
          {featureFlags.length === 0 ? (
            <div className="text-xs text-slate-400 py-4">Loading feature flags...</div>
          ) : (
            featureFlags.map((flag) => (
              <div 
                key={flag.id || flag.name} 
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white"
              >
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{flag.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {flag.description || 'Enable or disable this platform subsystem.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => flagMutation.mutate({ name: flag.name, isEnabled: !flag.isEnabled })}
                  className="focus:outline-none"
                >
                  {flag.isEnabled ? (
                    <ToggleRight className="w-9 h-9 text-brand-600 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300 cursor-pointer" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* System Settings Form */}
      <Card title="Statutory Platform Configuration">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">CBN Statutory Interbank SLA</span>
              <p className="text-slate-500 text-[11px] mb-3">Maximum resolution threshold before regulatory escalation.</p>
              <Input value="72 Hours" readOnly />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">NCC Telecom / Value SLA</span>
              <p className="text-slate-500 text-[11px] mb-3">Statutory window for airtime and utility tokens.</p>
              <Input value="24 Hours" readOnly />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
