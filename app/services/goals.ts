import { supabase } from './supabase';
import { transactionsService } from './transactions';

export type GoalType = 'category' | 'card' | 'general';
export type GoalPeriod = 'monthly' | 'yearly' | 'custom';
export type GoalStatus = 'ok' | 'warning' | 'exceeded';

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  type: GoalType;
  target_value: number;
  is_percentage: boolean; // true se for % da receita, false se for valor fixo
  period: GoalPeriod;
  start_date?: string;
  end_date?: string;
  category_id?: string;
  card_id?: string;
  whatsapp_alerts: boolean;
  alert_levels: number[]; // Ex: [70, 90, 100]
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GoalProgress = {
  goal: Goal;
  current_value: number;
  target_value: number;
  percentage: number;
  status: GoalStatus;
  remaining_value: number;
  period_start: string;
  period_end: string;
};

export const goalsService = {
  // Criar nova meta
  create: async (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      return { data: null, error };
    }
  },

  // Buscar todas as metas do usuário
  getAll: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Erro de autenticação:', authError);
        return { data: null, error: authError };
      }
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      return { data: null, error };
    }
  },

  // Buscar meta por ID
  getById: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar meta:', error);
      return { data: null, error };
    }
  },

  // Atualizar meta
  update: async (id: string, goalData: Partial<Goal>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('goals')
        .update({
          ...goalData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      return { data: null, error };
    }
  },

  // Excluir meta
  delete: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      return { error };
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      return { error };
    }
  },

  // Calcular período da meta
  calculatePeriod: (goal: Goal) => {
    const now = new Date();
    let start: Date, end: Date;

    switch (goal.period) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        start = goal.start_date ? new Date(goal.start_date) : new Date();
        end = goal.end_date ? new Date(goal.end_date) : new Date();
        break;
      default:
        start = new Date();
        end = new Date();
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  },

  // Calcular progresso de uma meta
  calculateProgress: async (goal: Goal): Promise<GoalProgress> => {
    try {
      const period = goalsService.calculatePeriod(goal);
      
      // Buscar transações do período (com fallback se falhar)
      let transactions: any[] = [];
      try {
        const { data: transactionsData } = await transactionsService.getAllWithFilters({
          startDate: period.start,
          endDate: period.end,
          type: 'expense' // Metas são sempre para despesas
        });
        transactions = transactionsData || [];
      } catch (transactionError) {
        console.error('Erro ao buscar transações para cálculo de progresso:', transactionError);
        transactions = [];
      }

      if (!transactions) {
        return {
          goal,
          current_value: 0,
          target_value: goal.target_value,
          percentage: 0,
          status: 'ok',
          remaining_value: goal.target_value,
          period_start: period.start,
          period_end: period.end
        };
      }

      let current_value = 0;
      let target_value = goal.target_value;

      // Filtrar transações baseado no tipo de meta
      const filteredTransactions = transactions.filter(transaction => {
        if (goal.type === 'category' && goal.category_id) {
          return transaction.category_id === goal.category_id;
        }
        if (goal.type === 'card' && goal.card_id) {
          // TODO: Implementar filtro por cartão quando o campo estiver disponível
          return true;
        }
        // Para meta geral, considera todas as despesas
        return true;
      });

      // Calcular valor atual
      current_value = filteredTransactions.reduce((sum, transaction) => {
        const amount = typeof transaction.amount === 'number' 
          ? transaction.amount 
          : parseFloat(transaction.amount.toString());
        return sum + amount;
      }, 0);

      // Se for percentual da receita, calcular o valor alvo
      if (goal.is_percentage) {
        try {
          const { data: incomeTransactions } = await transactionsService.getAllWithFilters({
            startDate: period.start,
            endDate: period.end,
            type: 'income'
          });

          const totalIncome = incomeTransactions?.reduce((sum, transaction) => {
            const amount = typeof transaction.amount === 'number' 
              ? transaction.amount 
              : parseFloat(transaction.amount.toString());
            return sum + amount;
          }, 0) || 0;

          target_value = (totalIncome * goal.target_value) / 100;
        } catch (incomeError) {
          console.error('Erro ao buscar receitas para cálculo percentual:', incomeError);
          // Fallback: usar valor original como se fosse fixo
          target_value = goal.target_value;
        }
      }

      const percentage = target_value > 0 ? (current_value / target_value) * 100 : 0;
      const remaining_value = Math.max(0, target_value - current_value);

      // Determinar status
      let status: GoalStatus = 'ok';
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 90) {
        status = 'warning';
      }

      return {
        goal,
        current_value,
        target_value,
        percentage,
        status,
        remaining_value,
        period_start: period.start,
        period_end: period.end
      };
    } catch (error) {
      console.error('Erro ao calcular progresso da meta:', error);
      return {
        goal,
        current_value: 0,
        target_value: goal.target_value,
        percentage: 0,
        status: 'ok',
        remaining_value: goal.target_value,
        period_start: '',
        period_end: ''
      };
    }
  },

  // Calcular progresso de todas as metas
  calculateAllProgress: async (): Promise<GoalProgress[]> => {
    try {
      const { data: goals, error } = await goalsService.getAll();
      
      if (error) {
        console.error('Erro ao buscar metas:', error);
        return [];
      }
      
      if (!goals || goals.length === 0) {
        return [];
      }

      const activeGoals = goals.filter(goal => goal.is_active);
      
      if (activeGoals.length === 0) {
        return [];
      }

      const progressPromises = activeGoals.map(goal => goalsService.calculateProgress(goal));
      return await Promise.all(progressPromises);
    } catch (error) {
      console.error('Erro ao calcular progresso de todas as metas:', error);
      return [];
    }
  },

  // Verificar alertas que devem ser enviados
  checkAlerts: async (): Promise<GoalProgress[]> => {
    try {
      const allProgress = await goalsService.calculateAllProgress();
      
      return allProgress.filter(progress => {
        if (!progress.goal.whatsapp_alerts || !progress.goal.alert_levels.length) {
          return false;
        }

        // Verificar se atingiu algum nível de alerta
        return progress.goal.alert_levels.some(level => 
          progress.percentage >= level && progress.percentage < level + 5 // Margem de 5% para evitar spam
        );
      });
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
      return [];
    }
  },

  // Formatar mensagem de alerta para WhatsApp
  formatAlertMessage: (progress: GoalProgress): string => {
    const { goal, current_value, target_value, percentage } = progress;
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    let message = `🎯 *Alerta de Meta Financeira*\n\n`;
    message += `📊 *Meta:* ${goal.name}\n`;
    message += `💰 *Gasto atual:* ${formatCurrency(current_value)}\n`;
    message += `🎯 *Limite:* ${formatCurrency(target_value)}\n`;
    message += `📈 *Progresso:* ${percentage.toFixed(1)}%\n\n`;

    if (percentage >= 100) {
      message += `🚨 *ATENÇÃO:* Meta estourada!\n`;
      message += `💸 *Excesso:* ${formatCurrency(current_value - target_value)}`;
    } else if (percentage >= 90) {
      message += `⚠️ *CUIDADO:* Você está próximo do limite!\n`;
      message += `💵 *Restante:* ${formatCurrency(target_value - current_value)}`;
    } else {
      message += `✅ Meta ainda dentro do limite.`;
    }

    return message;
  }
}; 