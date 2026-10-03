import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import ReceiptModal from '../common/ReceiptModal';
import { 
  Receipt, 
  Search, 
  Download, 
  Printer, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';

export default function LedgerReconciliation() {
  const { ledger } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filteredTxns = ledger.filter((txn) => {
    const matchesSearch = 
      (txn.txn_ref || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.account_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && txn.txn_type === filterType;
  });

  const totalInflows = ledger
    .filter(t => t.txn_type === 'DEPOSIT' || t.txn_type === 'REPAYMENT' || t.txn_type === 'INVESTMENT_FUNDING')
    .reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const totalOutflows = ledger
    .filter(t => t.txn_type === 'WITHDRAWAL' || t.txn_type === 'DISBURSEMENT')
    .reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const exportCSV = () => {
    const headers = ["Transaction ID", "Reference", "User", "Account", "Type", "Amount", "Balance Before", "Balance After", "Status", "Timestamp", "Notes"];
    const rows = filteredTxns.map(t => [
      t.id,
      t.txn_ref,
      `"${t.user_name || 'Customer'}"`,
      `"${t.account_title || t.account_type}"`,
      t.txn_type,
      t.amount,
      t.balance_before,
      t.balance_after,
      t.status,
      new Date(t.created_at).toISOString(),
      `"${t.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `able_invest_general_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">General Ledger & Double-Entry Accounting</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audited Integrity
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete financial transaction logs with immutable audit trail, balance before/after verification, and cashier receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" /> Print Ledger
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV Audit
          </button>
        </div>
      </div>

      {/* Accounting Inflow / Outflow Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Capital Inflows</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-mono">
            +₦{totalInflows.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Deposits, Repayments & Investment Subscriptions</p>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Total Capital Outflows</span>
          <div className="text-xl sm:text-2xl font-black text-rose-900 mt-1 font-mono">
            -₦{totalOutflows.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-700 mt-0.5">Loan Disbursements & Customer Withdrawals</p>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Net Ledger Balance</span>
          <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-1 font-mono">
            ₦{(totalInflows - totalOutflows).toLocaleString()}
          </div>
          <p className="text-[11px] text-indigo-700 mt-0.5">Reconciled double-entry asset position</p>
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
            placeholder="Search by txn reference, customer name, or account note..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">All Ledger Movements</option>
            <option value="DEPOSIT">Savings Deposits</option>
            <option value="WITHDRAWAL">Customer Withdrawals</option>
            <option value="INVESTMENT_FUNDING">Investment Subscriptions</option>
            <option value="DISBURSEMENT">Loan Disbursements</option>
            <option value="REPAYMENT">Loan Repayments</option>
          </select>
        </div>
      </div>

      {/* General Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 pl-4">Transaction Ref</th>
                <th className="py-3.5">User & Account</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5 text-right">Amount</th>
                <th className="py-3.5 text-right">Balance Before</th>
                <th className="py-3.5 text-right">Balance After</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-right pr-4">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-400 text-xs">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  const isCredit = txn.txn_type === 'DEPOSIT' || txn.txn_type === 'REPAYMENT' || txn.txn_type === 'INVESTMENT_FUNDING';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-4 font-mono font-bold text-slate-800">
                        {txn.txn_ref}
                        <span className="block text-[10px] text-slate-400 font-sans">{new Date(txn.created_at).toLocaleDateString()}</span>
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-900">{txn.user_name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500">{txn.account_title || txn.account_type}</div>
                      </td>

                      <td className="py-3.5">
                        <span className="font-semibold text-slate-700">{txn.account_type}</span>
                      </td>

                      <td className="py-3.5 font-bold uppercase text-[11px] text-slate-800">
                        {txn.txn_type?.replace('_', ' ')}
                      </td>

                      <td className={`py-3.5 text-right font-black ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCredit ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-right font-mono text-slate-500">
                        ₦{Number(txn.balance_before || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-right font-mono font-bold text-slate-800">
                        ₦{Number(txn.balance_after || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-center">
                        <Badge status={txn.status} />
                      </td>

                      <td className="py-3.5 text-right pr-4">
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition shadow-xs"
                        >
                          Voucher
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Modal */}
      {selectedTxn && (
        <ReceiptModal
          isOpen={Boolean(selectedTxn)}
          onClose={() => setSelectedTxn(null)}
          txn={selectedTxn}
        />
      )}
    </div>
  );
}
