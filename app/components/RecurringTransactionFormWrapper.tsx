import { createContext, useContext } from 'react';
import { RecurringTransactionForm } from './RecurringTransactionForm';
import type { RecurringTransaction } from '../services/recurringTransactions';

// Cria um contexto fake para autenticação apenas para testes
const FakeAuthContext = createContext({ user: { id: 'debug-user-id', email: 'teste@example.com' } });

// Hook para usar o contexto fake
export const useFakeAuth = () => useContext(FakeAuthContext);

type RecurringTransactionFormWrapperProps = {
  onClose: () => void;
  onSuccess: () => void;
  transaction?: RecurringTransaction;
  isEditing?: boolean;
};

// Este componente é apenas para testes durante o desenvolvimento
// Substitui o hook useAuth no RecurringTransactionForm.tsx pelo hook useFakeAuth
export function RecurringTransactionFormWrapper(props: RecurringTransactionFormWrapperProps) {
  return (
    <FakeAuthContext.Provider value={{ user: { id: 'debug-user-id', email: 'teste@example.com' } }}>
      <RecurringTransactionForm {...props} />
    </FakeAuthContext.Provider>
  );
} 