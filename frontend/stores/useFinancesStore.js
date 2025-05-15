// stores/useFinancesStore.js
import { create } from 'zustand';

const useFinancesStore = create((set) => ({
  income: [],
  expenses: [],
  setIncome: (income) => set({ income }),
  setExpenses: (expenses) => set({ expenses }),
  addIncome: (newIncome) =>
    set((state) => ({ income: [newIncome, ...state.income] })),
  addExpense: (newExpense) =>
    set((state) => ({ expenses: [newExpense, ...state.expenses] })),
}));

export default useFinancesStore;
