import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background dark:bg-card shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-primary dark:text-blue-400">
                  EuGastei
                </Link>
              </div>
              
              {user && (
                <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-text-muted dark:text-text-secondary hover:border-border hover:text-text-secondary dark:hover:text-text inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/transactions"
                    className="border-transparent text-text-muted dark:text-text-secondary hover:border-border hover:text-text-secondary dark:hover:text-text inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Transações
                  </Link>
                </nav>
              )}
            </div>
            
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center">
                  <span className="text-sm text-text-secondary dark:text-text-secondary mr-4 hidden sm:block">
                    {user.email}
                  </span>
                  <button 
                    onClick={() => signOut()} 
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-text-secondary dark:text-text-secondary hover:text-text dark:hover:text-text"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu for small screens */}
      {user && (
        <div className="sm:hidden bg-background dark:bg-card shadow-sm border-t border-border dark:border-border">
          <nav className="flex justify-around py-2">
            <Link
              to="/"
              className="text-text-muted dark:text-text-secondary hover:text-text-secondary dark:hover:text-text px-3 py-2 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="text-text-muted dark:text-text-secondary hover:text-text-secondary dark:hover:text-text px-3 py-2 text-sm font-medium"
            >
              Transações
            </Link>
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-background dark:bg-card border-t border-border dark:border-border py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-text-muted dark:text-text-muted">
            &copy; {new Date().getFullYear()} EuGastei - Gerenciador Financeiro
          </p>
        </div>
      </footer>
    </div>
  );
} 