import { SidebarLayout } from "../layouts/SidebarLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Modal } from "../components/Modal";
import { useState, useEffect } from "react";
import { cartoesService, type Cartao, type CreateCartaoData } from "../services/cartoes";
import { formatCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";

export default function CartoesPage() {
  const { user } = useAuth();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados para edição
  const [editingCard, setEditingCard] = useState<Cartao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para exclusão
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // Estados do formulário para pré-visualização
  const [formData, setFormData] = useState({
    nome: '',
    limite: '',
    vencimento: '',
    selectedColor: '#8A2BE2'
  });

  // Cores disponíveis
  const availableColors = [
    '#8A2BE2', // Roxo (Nubank)
    '#CC092F', // Vermelho (Santander)
    '#EC7000', // Laranja (Itaú)
    '#EA0029', // Vermelho escuro (Bradesco)
    '#007AFF', // Azul (Caixa)
    '#52CC4B', // Verde (Sicredi)
    '#2D3748'  // Cinza escuro (Outros bancos)
  ];

  // Carregar cartões
  useEffect(() => {
    const loadCartoes = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await cartoesService.getAll(user.id);
        if (error) throw error;
        setCartoes(data);
      } catch (err) {
        console.error('Erro ao carregar cartões:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar cartões');
      } finally {
        setLoading(false);
      }
    };

    loadCartoes();
  }, [user?.id]);

  // Função para salvar cartão (criar ou editar)
  const handleSaveCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    // Validações do front-end
    if (!formData.nome.trim()) {
      setError('Nome do cartão é obrigatório');
      return;
    }

    if (!formData.limite || parseFloat(formData.limite) <= 0) {
      setError('Limite deve ser maior que zero');
      return;
    }

    if (!formData.vencimento || parseInt(formData.vencimento) < 1 || parseInt(formData.vencimento) > 31) {
      setError('Dia de vencimento deve estar entre 1 e 31');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const cartaoData: CreateCartaoData = {
        nome: formData.nome.trim(),
        limite: parseFloat(formData.limite),
        vencimento: parseInt(formData.vencimento),
        cor: formData.selectedColor,
        ativo: true
      };

      if (isEditing && editingCard) {
        // Atualizar cartão existente
        const { data, error } = await cartoesService.update(editingCard.id, cartaoData);
        if (error) throw error;
        console.log('Cartão atualizado:', data);
      } else {
        // Criar novo cartão
        const { data, error } = await cartoesService.create(cartaoData, user.id);
        if (error) throw error;
        console.log('Cartão criado:', data);
      }

      setIsModalOpen(false);
      resetForm();
      await loadCartoes();
    } catch (err) {
      console.error('Erro ao salvar cartão:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão');
    } finally {
      setSaving(false);
    }
  };

  // Função para abrir modal de edição
  const handleEditCard = (card: Cartao) => {
    setEditingCard(card);
    setIsEditing(true);
    setFormData({
      nome: card.nome,
      limite: card.limite.toString(),
      vencimento: card.vencimento.toString(),
      selectedColor: card.cor
    });
    setIsModalOpen(true);
  };

  // Função para excluir cartão
  const handleDeleteCard = async (cardId: string) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.');
    if (!confirmDelete) return;

    setDeletingCardId(cardId);
    try {
      const { error } = await cartoesService.delete(cardId);
      if (error) throw error;
      
      await loadCartoes();
    } catch (err) {
      console.error('Erro ao excluir cartão:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir cartão');
    } finally {
      setDeletingCardId(null);
    }
  };

  // Recarregar cartões
  const loadCartoes = async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await cartoesService.getAll(user.id);
      if (error) throw error;
      setCartoes(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar cartões:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      limite: '',
      vencimento: '',
      selectedColor: '#8A2BE2'
    });
    setEditingCard(null);
    setIsEditing(false);
  };

  // Atualizar dados do formulário
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para abrir modal de novo cartão
  const handleNewCard = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="w-full">
          {/* Page Header - Container de 104px com conteúdo centralizado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                Cartões de Crédito
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base lg:text-lg">
                Gerencie seus cartões de crédito
              </p>
            </div>
            <button
              onClick={handleNewCard}
              className="bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-white text-sm sm:text-[16px] font-semibold px-4 sm:px-6 lg:px-[42px] py-3 lg:py-[16px] rounded-[8px] flex items-center justify-center transition-all hover:opacity-90 btn-transaction-gradient"
              style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
            >
              <span className="hidden sm:inline">Novo Cartão</span>
              <span className="sm:hidden">Novo</span>
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
                    <span className="text-text-secondary">Carregando cartões...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 content-box">
                  <div className="text-red-600 dark:text-red-400 text-center">
                    <p className="mb-4">{error}</p>
                    <button 
                      onClick={loadCartoes} 
                      className="text-primary underline hover:opacity-80 transition-opacity"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="content-box p-6">
                  {cartoes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-text-secondary text-lg mb-2">
                        Nenhum cartão encontrado
                      </p>
                      <p className="text-text-muted text-sm">
                        Adicione seu primeiro cartão de crédito
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cartoes.map((card) => (
                        <div key={card.id} className="flex justify-center">
                          <div 
                            className="w-full max-w-[440px] rounded-xl text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 p-5"
                            style={{
                              background: `linear-gradient(135deg, ${card.cor}, ${card.cor}dd)`,
                              aspectRatio: '1.7',
                              minHeight: '260px'
                            }}
                          >
                            {/* Background pattern */}
                            <div 
                              className="absolute inset-0 opacity-10"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              }}
                            />
                            
                            {/* Conteúdo do cartão */}
                            <div className="relative z-10 h-full flex flex-col justify-between">
                              {/* Header - Topo */}
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg lg:text-xl font-bold truncate flex-1 pr-2">
                                  {card.nome}
                                </h3>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                  card.ativo 
                                    ? 'bg-white bg-opacity-20 text-white' 
                                    : 'bg-gray-500 bg-opacity-80 text-white'
                                }`}>
                                  {card.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              
                              {/* Meio - Informações principais */}
                              <div className="flex-1 space-y-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-90">Limite total</span>
                                    <span className="font-bold text-base lg:text-lg">
                                      {formatCurrency(card.limite)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm opacity-90">Vencimento</span>
                                    <span className="font-semibold text-base">
                                      Dia {card.vencimento}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Base - Botões de ação */}
                              <div className="flex gap-2 mt-6">
                                <button 
                                  onClick={() => handleEditCard(card)}
                                  className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteCard(card.id)}
                                  disabled={deletingCardId === card.id}
                                  className="flex-1 bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  {deletingCardId === card.id ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Excluindo...
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Excluir
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Adicionar/Editar Cartão */}
        <Modal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}>
          <div className="bg-modal-light backdrop-blur-xl rounded-xl p-8 border border-border shadow-2xl">
            <h2 className="text-xl font-semibold text-text mb-6">
              {isEditing ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
            </h2>
            
            {/* Pré-visualização do cartão */}
            <div className="flex justify-center items-center flex-col mb-8">
              <div className="relative flex justify-center items-center w-full max-w-[500px] h-[320px]">
                {/* Cartão de fundo esquerdo */}
                <div className="absolute w-[360px] h-[212px] bg-gray-200 dark:bg-gray-700 rounded-xl shadow-lg translate-x-[-30px] translate-y-[8px] z-0 opacity-60"></div>

                {/* Cartão de fundo direito */}
                <div className="absolute w-[360px] h-[212px] bg-gray-300 dark:bg-gray-600 rounded-xl shadow-lg translate-x-[30px] translate-y-[8px] z-0 opacity-60"></div>

                {/* Cartão principal */}
                <div 
                  className="relative z-10 w-[400px] h-[235px] rounded-xl p-5 text-white overflow-hidden transition-all duration-300 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${formData.selectedColor}, ${formData.selectedColor}dd)`,
                    aspectRatio: '1.7'
                  }}
                >
                  {/* Background pattern */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                  
                  {/* Conteúdo do cartão */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header - Topo */}
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold truncate flex-1 pr-2">
                        {formData.nome || 'Nome do cartão'}
                      </h3>
                      <span className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white bg-opacity-20 text-white">
                        Ativo
                      </span>
                    </div>
                    
                    {/* Meio - Informações principais */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-90">Limite total</span>
                          <span className="font-bold text-base">
                            {formData.limite ? formatCurrency(parseFloat(formData.limite) || 0) : 'R$ 0,00'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-90">Vencimento</span>
                          <span className="font-semibold text-base">
                            Dia {formData.vencimento || '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Base - Espaço para botões (não mostrados na preview) */}
                    <div className="mt-6">
                      <div className="text-xs opacity-70 text-center">
                        Pré-visualização do cartão
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSaveCartao}>
              <div className="space-y-4">
                {/* Nome do cartão */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Nome do cartão
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    required
                    placeholder="Ex: Nubank, Itaú, Bradesco..."
                    className="w-full px-3 py-2 bg-input-bg border border-input-border/30 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Limite */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Limite (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.limite}
                    onChange={(e) => updateFormData('limite', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="5000.00"
                    className="w-full px-3 py-2 bg-input-bg border border-input-border/30 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Vencimento */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Dia do vencimento
                  </label>
                  <input
                    type="number"
                    value={formData.vencimento}
                    onChange={(e) => updateFormData('vencimento', e.target.value)}
                    required
                    min="1"
                    max="31"
                    placeholder="15"
                    className="w-full px-3 py-2 bg-input-bg border border-input-border/30 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-sm font-medium text-text mb-3">
                    Cor do cartão
                  </label>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateFormData('selectedColor', color)}
                        className={`w-8 h-8 rounded transition-all hover:scale-105 ${
                          formData.selectedColor === color 
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#090A0F]' 
                            : 'hover:ring-1 hover:ring-gray-400 hover:ring-offset-1 hover:ring-offset-[#090A0F]'
                        }`}
                        style={{ 
                          backgroundColor: color,
                          boxShadow: formData.selectedColor === color 
                            ? 'inset 0 2px 4px rgba(0,0,0,0.3)' 
                            : 'none'
                        }}
                      />
                    ))}
                    
                    {/* Quadrado de cor customizada com gradiente */}
                    <button
                      type="button"
                      onClick={() => {
                        // Ativar o input de cor
                        const colorInput = document.getElementById('custom-color-input') as HTMLInputElement;
                        colorInput?.click();
                      }}
                      className={`w-8 h-8 rounded transition-all hover:scale-105 ${
                        !availableColors.includes(formData.selectedColor)
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#090A0F]' 
                          : 'hover:ring-1 hover:ring-gray-400 hover:ring-offset-1 hover:ring-offset-[#090A0F]'
                      }`}
                      style={{ 
                        background: 'linear-gradient(90deg, #007aff, #6D59C1, #FF6D6D)',
                        boxShadow: !availableColors.includes(formData.selectedColor)
                          ? 'inset 0 2px 4px rgba(0,0,0,0.3)' 
                          : 'none'
                      }}
                    />
                  </div>
                  
                  {/* Input de cor customizada (oculto) */}
                  <input
                    id="custom-color-input"
                    type="color"
                    value={formData.selectedColor}
                    onChange={(e) => updateFormData('selectedColor', e.target.value)}
                    className="sr-only"
                  />
                  
                  {/* Indicador de cor customizada */}
                  {!availableColors.includes(formData.selectedColor) && (
                    <p className="text-xs text-text-muted mt-2">
                      Cor customizada: {formData.selectedColor.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-card border border-border text-text rounded-lg hover:bg-card transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-text rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </SidebarLayout>
    </ProtectedRoute>
  );
} 