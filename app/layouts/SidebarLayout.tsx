import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import Logo from '../../src/assets/eugasteilogo.svg';

type SidebarLayoutProps = {
  children: ReactNode;
};

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const location = useLocation();

  // Detectar tamanho da tela e ajustar comportamento
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1366);
      
      // Fechar sidebar automaticamente em telas menores
      if (width < 1366) {
        setSidebarOpen(false);
      }
    };

    // Verificar tamanho inicial
    handleResize();
    
    // Listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Removed - using useTheme hook now

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Função para verificar se a rota está ativa
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Função para obter as classes CSS do botão de navegação
  const getNavButtonClasses = (path: string) => {
    const baseClasses = "flex items-center py-3 px-4 rounded-xl transition-all duration-200";
    const isActive = isActiveRoute(path);
    
    if (isActive) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-text-secondary hover:text-text nav-hover-bg`;
  };

  // Função para obter o estilo inline do botão de navegação
  const getNavButtonStyle = (path: string) => {
    const isActive = isActiveRoute(path);
    
    if (isActive) {
      return {
        backgroundColor: '#24253C',
        gap: '20px'
      };
    }
    
    return {
      backgroundColor: 'transparent',
      gap: '20px'
    };
  };

  // Componente da Sidebar
  const SidebarContent = () => (
    <div className="flex flex-col h-full relative z-10">
      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        <Link
          to="/"
          className={getNavButtonClasses('/')}
          style={getNavButtonStyle('/')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Dashboard
        </Link>
        <Link
          to="/transactions"
          className={getNavButtonClasses('/transactions')}
          style={getNavButtonStyle('/transactions')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Transações
        </Link>
        <Link
          to="/relatorio"
          className={getNavButtonClasses('/relatorio')}
          style={getNavButtonStyle('/relatorio')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zm0 6a1 1 0 000 2h9a1 1 0 100-2H3zm0 6a1 1 0 100 2h9a1 1 0 100-2H3zm14-6a1 1 0 10-2 0v6a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
          Relatório
        </Link>
        <Link
          to="/categories"
          className={getNavButtonClasses('/categories')}
          style={getNavButtonStyle('/categories')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Categorias
        </Link>
        <Link
          to="/cartoes"
          className={getNavButtonClasses('/cartoes')}
          style={getNavButtonStyle('/cartoes')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
          Cartões
        </Link>
        <Link
          to="/metas"
          className={getNavButtonClasses('/metas')}
          style={getNavButtonStyle('/metas')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Metas
        </Link>
        <Link
          to="/settings"
          className={getNavButtonClasses('/settings')}
          style={getNavButtonStyle('/settings')}
          onClick={closeSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Configurações
        </Link>
      </nav>

      {/* Divider */}
      <div className="mt-8 lg:mt-16 mb-4 lg:mb-8 h-px bg-border" />

      {/* Theme Toggle */}
      <div className="mb-4 lg:mb-6">
        <div 
          className="flex items-center py-3 px-4 text-text-secondary rounded-xl transition-all duration-200 nav-hover-bg cursor-pointer hover:text-text"
          style={{ gap: '20px' }}
          onClick={toggleTheme}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 102 0v-1a1 1 0 01-1-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          <span className="flex-1">Tema</span>
          <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition rounded-full bg-white ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div 
          className="flex items-center mt-6 lg:mt-12"
          style={{
            gap: '12px',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '14px',
            color: '#71717A'
          }}
        >
          <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-text">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="truncate text-text-secondary">Olá, {user.email?.split('@')[0] || 'Usuário'}!</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background m-0 p-0">
      {/* Top Navigation Bar - Static (not fixed) */}
      <div 
        className="w-full bg-card border-b-2 border-[#20212A] rounded-none light-mode-top-border"
        style={{ 
          height: '110px',
          borderRadius: '0 !important',
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          borderBottomLeftRadius: '0 !important',
          borderBottomRightRadius: '0 !important'
        }}
      >
        <div className="h-full flex items-center justify-between" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          {/* Logo no menu superior */}
          <div className="flex items-center">
            <Link to="/" className="block">
              <img 
                src={Logo} 
                alt="EuGastei" 
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          {/* Placeholder para perfil/conteúdo futuro */}
          <div className="flex items-center gap-4">
            <span className="text-text-secondary text-sm">Perfil</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Removed border */}
        <div className={`
          fixed left-0 top-[110px] h-[calc(100vh-110px)] bg-card z-40 transition-transform duration-300 ease-in-out
          ${isDesktop ? 'translate-x-0' : (sidebarOpen ? 'translate-x-0' : '-translate-x-full')}
          w-[340px]
        `}>
          <div className="p-10 h-full overflow-y-auto">
            <SidebarContent />
          </div>
        </div>

        {/* Overlay para mobile */}
        {!isDesktop && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 ${isDesktop ? 'ml-[340px]' : ''}`}>
          {/* Mobile Header */}
          {!isDesktop && (
            <div className="lg:hidden bg-card border-b border-border p-4 sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-text-secondary hover:text-text hover:bg-text/5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <img 
                  src={Logo} 
                  alt="EuGastei" 
                  className="h-6 w-auto"
                />
                <div className="w-10"></div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 