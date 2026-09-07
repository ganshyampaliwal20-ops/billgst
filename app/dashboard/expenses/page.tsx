"use client";
import React, { useState } from 'react';
import BusinessExpensesPage from './BusinessExpenses';
import PersonalExpenses from './PersonalExpenses';
import { FaMoneyBillWave, FaWallet } from 'react-icons/fa';

export default function ExpensesWrapper() {
  const [tab, setTab] = useState<'business' | 'personal'>('business');

  return (
    <div className="w-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex w-full justify-between items-center px-4 pt-4 pb-4 bg-white dark:bg-[#0b1224] border-b border-gray-200 dark:border-gray-800/60">
        <button
          onClick={() => setTab('business')}
          className={`flex-1 flex justify-center items-center space-x-2 px-6 py-3 mr-2 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${
            tab === 'business'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <FaMoneyBillWave className={tab === 'business' ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'} size={18} />
          <span>Business Expenses</span>
        </button>
        <button
          onClick={() => setTab('personal')}
          className={`flex-1 flex justify-center items-center space-x-2 px-6 py-3 ml-2 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${
            tab === 'personal'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <FaWallet className={tab === 'personal' ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'} size={18} />
          <span>Personal Expenses</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full">
        {tab === 'business' ? <BusinessExpensesPage /> : <PersonalExpenses />}
      </div>
    </div>
  );
}
