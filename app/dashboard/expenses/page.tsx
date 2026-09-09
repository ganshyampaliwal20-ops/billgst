"use client";
import React, { useState } from 'react';
import BusinessExpensesPage from './BusinessExpenses';
import PersonalExpenses from './PersonalExpenses';
import { FaMoneyBillWave, FaWallet } from 'react-icons/fa';

export default function ExpensesWrapper() {
  const [tab, setTab] = useState<'business' | 'personal'>('business');

  return (
    <div className="w-full flex flex-col pt-14 md:pt-16">
      <style dangerouslySetInnerHTML={{__html: `
        .expense-toggle-wrap {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
        }
        .expense-toggle {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: linear-gradient(180deg, #1e1a45, #161235);
          border: 1px solid rgba(155,77,255,0.25);
          border-radius: 16px;
          padding: 6px;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.04), 0 8px 24px rgba(10,6,35,0.55);
        }
        .expense-toggle .thumb {
          position: absolute;
          top: 6px;
          bottom: 6px;
          left: 6px;
          width: calc(50% - 6px);
          border-radius: 11px;
          background: linear-gradient(135deg, #6d3ff2, #9b4dff);
          box-shadow: 0 4px 14px rgba(109,63,242,0.55), inset 0 0 0 1px rgba(255,255,255,0.06);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }
        .expense-toggle.personal .thumb {
          transform: translateX(100%);
        }
        .expense-toggle button {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.2px;
          color: #a9a3d1;
          border-radius: 11px;
          transition: color 0.3s ease;
          font-family: inherit;
        }
        .expense-toggle button.active {
          color: #ffffff;
        }
        .expense-toggle button:focus-visible {
          outline: 2px solid #f0b429;
          outline-offset: 2px;
        }
        .expense-toggle button .icon {
          width: 18px;
          height: 18px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .expense-toggle button .icon svg {
          width: 100%;
          height: 100%;
        }
        @media (min-width: 480px) {
          .expense-toggle button {
            font-size: 16px;
            padding: 14px 12px;
          }
        }
      `}} />

      {/* Tab Navigation (Exact User Design) */}
      <div className="flex w-full justify-center items-center px-4 md:px-6 pt-6 pb-4 bg-[#0b1224]">
        <div className="expense-toggle-wrap">
          <div className={`expense-toggle ${tab === 'personal' ? 'personal' : 'business'}`}>
            <div className="thumb"></div>
            <button
              type="button"
              className={tab === 'business' ? 'active' : ''}
              onClick={() => setTab('business')}
            >
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2"></rect>
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </span>
              Business Expenses
            </button>
            <button
              type="button"
              className={tab === 'personal' ? 'active' : ''}
              onClick={() => setTab('personal')}
            >
              <span className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              Personal Expenses
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full">
        {tab === 'business' ? <BusinessExpensesPage /> : <PersonalExpenses />}
      </div>
    </div>
  );
}
