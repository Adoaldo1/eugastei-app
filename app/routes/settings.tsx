import { SidebarLayout } from '../layouts/SidebarLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="w-full" data-route="settings">
          {/* Page Header - Container de 104px com conteúdo centralizado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                Configurações
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base lg:text-lg">
                Personalize sua experiência
              </p>
            </div>
          </div>

          {/* Moldura Externa da Dashboard */}
          <div 
            className="border-t-2 border-l-2 border-[#20212A] shadow-sm min-h-[calc(100vh-110px)] light-mode-frame-border"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '0',
              borderBottomLeftRadius: '0',
              borderBottomRightRadius: '0',
              padding: '40px',
              margin: '0'
            }}
          >
            <div className="space-y-6">
              {/* Seção de Tema */}
              <div className="content-box p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Aparência</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">Tema</p>
                    <p className="text-sm text-text-secondary">Escolha entre tema claro ou escuro</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-card-hover transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                        Claro
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        Escuro
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Seção de Perfil */}
              <div className="content-box p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Perfil</h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-text">Email</p>
                    <p className="text-sm text-text-secondary">{user?.email || 'Não disponível'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-text">ID do Usuário</p>
                    <p className="text-sm text-text-secondary font-mono">
                      {user?.id || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção de Logout */}
              <div className="content-box p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Conta</h2>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
} 