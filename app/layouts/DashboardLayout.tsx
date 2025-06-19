import { DashboardProvider } from '../context/DashboardContext';
import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  );
} 