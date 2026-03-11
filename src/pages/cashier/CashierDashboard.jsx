import React, { useState, useEffect } from 'react';
import { Wallet, Users, Receipt, CreditCard } from 'lucide-react'; // Siguraduhing naka-install ang lucide-react

const CashierDashboard = () => {
  // Mock data muna habang wala pa tayong API response
  const [stats, setStats] = useState({
    totalCollections: "₱0.00",
    pendingPayments: 0,
    processedScholarships: 0,
    recentTransactions: []
  });

  useEffect(() => {
    // Dito natin tatawagin ang PHP API mo mamaya
    // fetchDashboardData();
    
    // Temporary static data para sa visual review
    setStats({
      totalCollections: "₱125,450.00",
      pendingPayments: 42,
      processedScholarships: 15,
      recentTransactions: [
        { id: 1, student: "Juan Dela Cruz", amount: "₱5,000", status: "Paid", date: "2023-10-27" },
        { id: 2, student: "Maria Clara", amount: "₱12,200", status: "Pending", date: "2023-10-27" },
        { id: 3, student: "Pedro Penduko", amount: "₱3,500", status: "Paid", date: "2023-10-26" },
      ]
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cashier Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's the financial summary for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Collections" value={stats.totalCollections} icon={<Wallet className="text-blue-600" />} color="border-blue-500" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} icon={<Users className="text-orange-600" />} color="border-orange-500" />
        <StatCard title="Scholarships Applied" value={stats.processedScholarships} icon={<Receipt className="text-green-600" />} color="border-green-500" />
        <StatCard title="Today's Transactions" value={stats.recentTransactions.length} icon={<CreditCard className="text-purple-600" />} color="border-purple-500" />
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            New Payment
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
              <th className="p-4">Student Name</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentTransactions.map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{tx.student}</td>
                <td className="p-4">{tx.amount}</td>
                <td className="p-4 text-gray-600">{tx.date}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tx.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
    </div>
  </div>
);

export default CashierDashboard;