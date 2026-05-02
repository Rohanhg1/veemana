import { createContext, useContext, useState, useEffect } from 'react';
import { getAllTransactions } from '../utils/contract';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshTransactions = async () => {
    setLoading(true);
    try {
      const txs = await getAllTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Could not fetch transactions:", err);
    }
    setLoading(false);
  };

  const addLocalTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const updateTransactionStatus = (id, updates) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  };

  useEffect(() => {
    refreshTransactions();
  }, []);

  return (
    <TransactionContext.Provider value={{
      transactions,
      loading,
      refreshTransactions,
      addLocalTransaction,
      updateTransactionStatus
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
