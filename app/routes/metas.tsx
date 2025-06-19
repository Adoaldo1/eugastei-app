import { useState, useEffect } from 'react';
import { SidebarLayout } from '../layouts/SidebarLayout';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { goalsService, type Goal, type GoalProgress } from '../services/goals';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function Metas() {
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Carregar metas e calcular progresso
  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primeiro, vamos tentar buscar apenas as metas sem calcular progresso
      const { data: goalsData, error: goalsError } = await goalsService.getAll();
      
      if (goalsError) {
        console.error('Erro ao buscar metas:', goalsError);
        setError('Erro ao buscar metas do banco de dados.');
        setGoals([]);
        return;
      }
      
      if (!goalsData || goalsData.length === 0) {
        setGoals([]);
        return;
      }
      
      // Se encontrou metas, tentar calcular progresso
      try {
        const progressData = await goalsService.calculateAllProgress();
        setGoals(progressData || []);
      } catch (progressError) {
        console.error('Erro ao calcular progresso, usando dados básicos:', progressError);
        // Fallback: criar progresso básico sem cálculos complexos
        const basicProgress = goalsData.map(goal => ({
          goal,
          current_value: 0,
          target_value: goal.target_value,
          percentage: 0,
          status: 'ok' as const,
          remaining_value: goal.target_value,
          period_start: '',
          period_end: ''
        }));
        setGoals(basicProgress);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      setError('Erro ao carregar metas. Tente novamente.');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Criar nova meta
  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    try {
      const { error } = await goalsService.create(goalData);
      if (error) {
        alert('Erro ao criar meta');
      } else {
        setShowForm(false);
        await loadGoals();
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      alert('Erro ao criar meta');
    } finally {
      setFormLoading(false);
    }
  };

  // Editar meta
  const handleEditGoal = async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingGoal) return;

    setFormLoading(true);
    try {
      const { error } = await goalsService.update(editingGoal.id, goalData);
      if (error) {
        alert('Erro ao atualizar meta');
      } else {
        setEditingGoal(null);
        setShowForm(false);
        await loadGoals();
      }
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      alert('Erro ao atualizar meta');
    } finally {
      setFormLoading(false);
    }
  };

  // Excluir meta
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const { error } = await goalsService.delete(goalId);
      if (error) {
        alert('Erro ao excluir meta');
      } else {
        await loadGoals();
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      alert('Erro ao excluir meta');
    }
  };

  // Abrir formulário para edição
  const openEditForm = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  // Fechar formulário
  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  // Estatísticas das metas
  const stats = {
    total: goals.length,
    ok: goals.filter(g => g.status === 'ok').length,
    warning: goals.filter(g => g.status === 'warning').length,
    exceeded: goals.filter(g => g.status === 'exceeded').length
  };

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="w-full">
          {/* Page Header - Container de 104px com conteúdo centralizado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                Metas Financeiras
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base lg:text-lg">
                Defina e acompanhe suas metas de economia
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-white text-sm sm:text-[16px] font-semibold px-4 sm:px-6 lg:px-[42px] py-3 lg:py-[16px] rounded-[8px] flex items-center justify-center transition-all hover:opacity-90 btn-transaction-gradient"
              style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
            >
              <span className="hidden sm:inline">Nova Meta</span>
              <span className="sm:hidden">Nova</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="ml-2 w-4 h-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-text-secondary">Carregando metas...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 content-box">
                  <div className="text-red-600 dark:text-red-400 text-center">
                    <p className="mb-4">{error}</p>
                    <button 
                      onClick={loadGoals} 
                      className="text-primary underline hover:opacity-80 transition-opacity"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="content-box p-6">
                  {goals.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-text-secondary text-lg mb-2">
                        Nenhuma meta encontrada
                      </p>
                      <p className="text-text-muted text-sm">
                        Crie sua primeira meta financeira
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {goals.map((goalProgress) => (
                        <GoalCard
                          key={goalProgress.goal.id}
                          progress={goalProgress}
                          onEdit={() => openEditForm(goalProgress.goal)}
                          onDelete={() => handleDeleteGoal(goalProgress.goal.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
} 