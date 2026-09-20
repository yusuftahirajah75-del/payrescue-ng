import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'BUSINESS_ADMIN' | 'BUSINESS_AGENT';
  joinedAt: string;
}

export const BusinessTeamPage: React.FC = () => {
  const { activeBusiness, user } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: user?.fullName || 'Current Administrator',
      email: user?.email || 'admin@payrescue.ng',
      role: 'BUSINESS_ADMIN',
      joinedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Chidi Okafor',
      email: 'c.okafor@company.ng',
      role: 'BUSINESS_AGENT',
      joinedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'BUSINESS_ADMIN' | 'BUSINESS_AGENT'>('BUSINESS_AGENT');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      addToast('warning', 'Please provide name and email');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name,
      email,
      role,
      joinedAt: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    addToast('success', `Invited ${name} as ${role === 'BUSINESS_ADMIN' ? 'Admin' : 'Agent'}`);
    setIsModalOpen(false);
    setName('');
    setEmail('');
  };

  const handleRemove = (id: string, memberName: string) => {
    setMembers(members.filter((m) => m.id !== id));
    addToast('info', `Removed ${memberName} from team`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Team & Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage authorized staff members for {activeBusiness?.name || 'your merchant organization'}.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Invite Team Member
        </Button>
      </div>

      <Card title={`Active Members (${members.length})`}>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                <th className="py-3 px-6">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Access Permissions</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    {m.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {m.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.role === 'BUSINESS_ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {m.role === 'BUSINESS_ADMIN' ? 'Business Admin' : 'Finance Agent'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {m.role === 'BUSINESS_ADMIN' 
                      ? 'Full Access (Reconciliation, API Keys, Billing)' 
                      : 'Reconciliation & Payment Verification Only'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {m.role !== 'BUSINESS_ADMIN' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemove(m.id, m.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite New Team Member"
        subtitle="Grant operational access to finance and support personnel."
      >
        <form onSubmit={handleAddMember} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            placeholder="e.g. Babatunde Lawal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Corporate Email Address"
            type="email"
            placeholder="e.g. b.lawal@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select
            label="Assigned Role"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            options={[
              { value: 'BUSINESS_AGENT', label: 'Finance Agent (Reconcile & Verify)' },
              { value: 'BUSINESS_ADMIN', label: 'Business Admin (Full Organization Access)' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
