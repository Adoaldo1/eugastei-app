import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../app/context/AuthContext';
import { DashboardProvider } from '../app/context/DashboardContext';
import { ProtectedRoute } from '../app/components/ProtectedRoute';

// Importar páginas
import Login from '../app/routes/login';
import Register from '../app/routes/register';
import Home from '../app/routes/home';
import Transactions from '../app/routes/transactions';
import Categories from '../app/routes/categories';
import Settings from '../app/routes/settings';
import Relatorio from '../app/routes/relatorio';
import Cartoes from '../app/routes/cartoes';
import Metas from '../app/routes/metas';

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorio"
            element={
              <ProtectedRoute>
                <Relatorio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cartoes"
            element={
              <ProtectedRoute>
                <Cartoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metas"
            element={
              <ProtectedRoute>
                <Metas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          {/* Rota padrão - redireciona para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App; 