import { Modal } from './Modal';
import { RecurringTransactionForm } from './RecurringTransactionForm';
import { AuthProvider } from '../context/AuthContext';
import { DashboardProvider } from '../context/DashboardContext';
import { useState } from 'react';
import type { RecurringTransaction } from '../services/recurringTransactions';

type RecurringTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: RecurringTransaction;
  isEditing?: boolean;
};

export function RecurringTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  isEditing = false
}: RecurringTransactionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AuthProvider>
        <DashboardProvider>
          <RecurringTransactionForm
            onClose={onClose}
            onSuccess={onSuccess}
            transaction={transaction}
            isEditing={isEditing}
          />
        </DashboardProvider>
      </AuthProvider>
    </Modal>
  );
} 