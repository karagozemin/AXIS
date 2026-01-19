'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Loan {
  id: string;
  type: 'borrow' | 'deposit' | 'repay';
  amount: number;
  collateral?: number;
  timestamp: Date;
  status: 'pending' | 'active' | 'completed';
  txId: string;
  tier?: string;
}

interface LoanContextType {
  loans: Loan[];
  deposits: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'timestamp'>) => void;
  addDeposit: (deposit: Omit<Loan, 'id' | 'timestamp'>) => void;
  totalDeposited: number;
  totalBorrowed: number;
  activeLoans: Loan[];
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [deposits, setDeposits] = useState<Loan[]>([]);

  const addLoan = useCallback((loan: Omit<Loan, 'id' | 'timestamp'>) => {
    const newLoan: Loan = {
      ...loan,
      id: `loan_${Date.now()}`,
      timestamp: new Date(),
    };
    setLoans(prev => [newLoan, ...prev]);
  }, []);

  const addDeposit = useCallback((deposit: Omit<Loan, 'id' | 'timestamp'>) => {
    const newDeposit: Loan = {
      ...deposit,
      id: `deposit_${Date.now()}`,
      timestamp: new Date(),
    };
    setDeposits(prev => [newDeposit, ...prev]);
  }, []);

  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalBorrowed = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.amount, 0);
  const activeLoans = loans.filter(l => l.status === 'active');

  return (
    <LoanContext.Provider value={{
      loans,
      deposits,
      addLoan,
      addDeposit,
      totalDeposited,
      totalBorrowed,
      activeLoans,
    }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoanContext() {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within LoanProvider');
  }
  return context;
}
