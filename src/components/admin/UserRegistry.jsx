import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { 
  Users, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  Building, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function UserRegistry() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await api.getUsers();
    if (res.data?.users) {
      setUsers(res.data.users);
    }
    setLoading(false);
  };

  const handleVerifyKyc = async (user) => {
    await api.updateKyc({
      user_id: user.id,
      kyc_status: 'VERIFIED'
    });
    await loadUsers();
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser({ ...selectedUser, kyc_status: 'VERIFIED' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm);

    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">User Registry & KYC Bureau</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Access & Identity Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directory of registered customers, credit analysts, and administrators with compliance verification.
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
          Total Users: <span className="text-emerald-700 font-mono">{users.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by full name, email or phone number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="LOAN_OFFICER">Loan Officers</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 pl-4">User ID & Name</th>
                <th className="py-3.5">Contact Details</th>
                <th className="py-3.5">Platform Role</th>
                <th className="py-3.5">KYC Status</th>
                <th className="py-3.5">Settlement Bank</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400 text-xs">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{u.id}</div>
                    </td>

                    <td className="py-3.5">
                      <div className="text-slate-800 font-medium">{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.phone}</div>
                    </td>

                    <td className="py-3.5">
                      <Badge status={u.role} />
                    </td>

                    <td className="py-3.5">
                      <Badge status={u.kyc_status || 'PENDING'} />
                    </td>

                    <td className="py-3.5 font-medium text-slate-700">
                      {u.bank_name ? `${u.bank_name} (${u.account_number})` : 'Not provided'}
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Active Account"></span>
                    </td>

                    <td className="py-3.5 text-right pr-4">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition shadow-xs"
                      >
                        Inspect KYC
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC INSPECT MODAL */}
      {selectedUser && (
        <Modal isOpen={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} title="Customer KYC & Profile Dossier" subtitle={`Account: ${selectedUser.full_name} (${selectedUser.id})`}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700">Compliance Verification Status:</span>
              <Badge status={selectedUser.kyc_status || 'PENDING'} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <span className="font-semibold text-slate-800">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <span className="font-semibold text-slate-800">{selectedUser.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BVN / NIN</span>
                <span className="font-mono font-bold text-slate-800">{selectedUser.bvn_nin || '22114455669'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Residential Address</span>
                <span className="font-medium text-slate-700">{selectedUser.address || 'Address on file'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Settlement Bank Verification</span>
              <div className="font-mono text-slate-800 font-bold">
                {selectedUser.bank_name || 'Bank'} • {selectedUser.account_number || '0123456789'}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Account Name: {selectedUser.account_name || selectedUser.full_name}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Next of Kin Records</span>
              <div className="text-slate-800 font-medium">
                {selectedUser.next_of_kin || 'No record provided'}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {selectedUser.kyc_status !== 'VERIFIED' && (
                <button
                  onClick={() => handleVerifyKyc(selectedUser)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Verify KYC
                </button>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
