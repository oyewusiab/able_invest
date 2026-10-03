import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import { 
  UserCheck, 
  ShieldCheck, 
  Building, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  CheckCircle2 
} from 'lucide-react';

export default function ProfileKYC() {
  const { currentUser, updateKyc } = useAuth();

  const [bvnNin, setBvnNin] = useState(currentUser?.bvn_nin || '22114455669');
  const [bankName, setBankName] = useState(currentUser?.bank_name || 'Guaranty Trust Bank');
  const [accountNumber, setAccountNumber] = useState(currentUser?.account_number || '0112233445');
  const [accountName, setAccountName] = useState(currentUser?.account_name || currentUser?.full_name || 'Babatunde Adebayo');
  const [address, setAddress] = useState(currentUser?.address || 'Obantoko, Abeokuta / Lagos, Nigeria');
  const [nextOfKin, setNextOfKin] = useState(currentUser?.next_of_kin || 'Sarah Adebayo (Wife)');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateKyc({
      bvn_nin: bvnNin,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      address,
      next_of_kin: nextOfKin
    });
    setIsSubmitting(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">KYC & Settlement Profile</h1>
            <Badge status={currentUser?.kyc_status || 'VERIFIED'} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain regulatory compliance and verified settlement bank details for automatic payouts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tier-2 Financial Verification</span>
        </div>
      </div>

      {/* KYC Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Personal Identity Records
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.full_name || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                disabled
                value={currentUser?.phone || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">BVN / NIN Identifier</label>
              <input
                type="text"
                value={bvnNin}
                onChange={(e) => setBvnNin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Next of Kin Details (Full Name, Relationship & Contact)</label>
            <input
              type="text"
              value={nextOfKin}
              onChange={(e) => setNextOfKin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Settlement Bank Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" /> Settlement Bank for Withdrawals & Loan Disbursements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                required
                maxLength="10"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Name</label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {isSaved && (
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> KYC Details Updated Successfully!
            </div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'Updating...' : 'Save & Update Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
