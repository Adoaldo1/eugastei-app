import type { GoalProgress } from '../../services/goals';
import { formatCurrency } from '../../utils/formatters';

type GoalCardProps = {
  progress: GoalProgress;
  onEdit: () => void;
  onDelete: () => void;
};

export function GoalCard({ progress, onEdit, onDelete }: GoalCardProps) {
  const { goal, current_value, target_value, percentage, status, remaining_value } = progress;

  const getStatusColor = () => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ok':
        return 'No limite';
      case 'warning':
        return 'Atenção';
      case 'exceeded':
        return 'Estourada';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'ok':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'exceeded':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = () => {
    switch (goal.type) {
      case 'category':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'card':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'general':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeText = () => {
    switch (goal.type) {
      case 'category':
        return 'Por Categoria';
      case 'card':
        return 'Por Cartão';
      case 'general':
        return 'Meta Geral';
      default:
        return 'Desconhecido';
    }
  };



  const getPeriodText = () => {
    switch (goal.period) {
      case 'monthly':
        return 'Mensal';
      case 'yearly':
        return 'Anual';
      case 'custom':
        return 'Personalizado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="content-box p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-primary">
              {getTypeIcon()}
            </div>
            <span className="text-sm text-text-secondary font-medium">
              {getTypeText()}
            </span>
            <span className="text-xs text-text-secondary">•</span>
            <span className="text-sm text-text-secondary">
              {getPeriodText()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-text truncate" title={goal.name}>
            {goal.name}
          </h3>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
          status === 'ok' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Progresso</span>
          <span className="text-sm font-semibold text-text">
            {Math.min(percentage, 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getStatusColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          {percentage > 100 && (
            <div 
              className="h-full bg-red-600 opacity-50"
              style={{ width: `${Math.min(percentage - 100, 100)}%` }}
            />
          )}
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-text-secondary mb-1">Gasto Atual</p>
          <p className="text-lg font-bold text-text">
            {formatCurrency(current_value)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">
            {goal.is_percentage ? 'Limite (% receita)' : 'Limite'}
          </p>
          <p className="text-lg font-bold text-text">
            {goal.is_percentage ? `${goal.target_value}%` : formatCurrency(target_value)}
          </p>
        </div>
      </div>

      {/* Remaining/Exceeded */}
      <div className="mb-4">
        {status === 'exceeded' ? (
          <div className="flex items-center space-x-2 text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium">
              Excesso: {formatCurrency(current_value - target_value)}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">
              Restante: {formatCurrency(remaining_value)}
            </span>
          </div>
        )}
      </div>

      {/* WhatsApp Alerts */}
      {goal.whatsapp_alerts && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-4 4 4M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Alertas WhatsApp ativos
            </span>
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            Níveis: {goal.alert_levels.join('%, ')}%
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editar</span>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Excluir</span>
        </button>
      </div>
    </div>
  );
} 