import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import ReceiptModal from '../common/ReceiptModal';
import { 
  ReceiptText, 
  Search, 
  Download, 
  Printer, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck 
} from 'lucide-react';

export default function TransactionHistory() {
  const { ledger } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filteredTransactions = ledger.filter((txn) => {
    const matchesSearch = 
      (txn.txn_ref || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.account_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && txn.txn_type === filterType;
  });

  const exportCSV = () => {
    const headers = ["Reference", "Date", "Account", "Type", "Amount", "Balance Before", "Balance After", "Status", "Notes"];
    const rows = filteredTransactions.map(t => [
      t.txn_ref,
      new Date(t.created_at).toISOString().split('T')[0],
      `"${t.account_title || t.account_type}"`,
      t.txn_type,
      t.amount,
      t.balance_before,
      t.balance_after,
      t.status,
      `"${t.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `able_invest_statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Double-Entry Financial Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete accounting audit trail of all deposits, disbursements, investments, and loan repayments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference number, account name or purpose..."
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
            <option value="ALL">All Categories</option>
            <option value="DEPOSIT">Savings Deposits</option>
            <option value="WITHDRAWAL">Savings Withdrawals</option>
            <option value="INVESTMENT_FUNDING">Investment Subscriptions</option>
            <option value="DISBURSEMENT">Loan Disbursements</option>
            <option value="REPAYMENT">Loan Repayments</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 pl-4">Transaction Ref</th>
                <th className="py-3.5">Timestamp</th>
                <th className="py-3.5">Category & Scheme</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5 text-right">Amount</th>
                <th className="py-3.5 text-right">Balance After</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-right pr-4">Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isCredit = txn.txn_type === 'DEPOSIT' || txn.txn_type === 'DISBURSEMENT';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pl-4 font-mono font-bold text-slate-800">{txn.txn_ref}</td>
                      <td className="py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleDateString()} {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-900">{txn.account_title || txn.account_type}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{txn.payment_method}</div>
                      </td>
                      <td className="py-3.5 font-bold uppercase text-[11px] text-slate-700">
                        {txn.txn_type?.replace('_', ' ')}
                      </td>
                      <td className={`py-3.5 text-right font-black ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right font-mono font-medium text-slate-600">
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
                          Receipt
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
