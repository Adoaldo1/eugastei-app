import { SidebarLayout } from "../layouts/SidebarLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useEffect, useState } from "react";
import { categoriesService, type Category, type CreateCategoryData } from "../services/categories";
import { useAuth } from "../context/AuthContext";
import { Toast, type ToastType } from "../components/Toast";

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    type: 'expense',
    color: '#1DB954'
  });
  
  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Show toast
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };
  
  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    console.log("Starting to load categories...");
    console.log("Current authenticated user:", user);
    
    try {
      const { data, error } = await categoriesService.getAll();
      
      if (error) {
        console.error("Error loading categories:", error);
        throw new Error(error.message);
      }
      
      console.log("Categories loaded successfully:", data);
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias';
      console.error("Exception when loading categories:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    console.log("Categories component mounted");
    loadCategories();
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting category form:", formData);
    
    try {
      if (editMode && editId) {
        console.log(`Updating category with ID ${editId}`);
        const { data, error } = await categoriesService.update(editId, formData);
        
        if (error) {
          throw new Error(error.message);
        }
        
        console.log("Category update result:", data);
        showToast('Categoria atualizada com sucesso!', 'success');
      } else {
        console.log("Creating new category");
        const { data, error } = await categoriesService.create(formData);
        
        if (error) {
          throw new Error(error.message);
        }
        
        console.log("Category creation result:", data);
        showToast('Categoria criada com sucesso!', 'success');
      }
      
      // Reset form and reload categories
      setFormData({ name: '', type: 'expense', color: '#1DB954' });
      setEditMode(false);
      setEditId(null);
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar categoria';
      console.error("Error saving category:", errorMessage);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing a category
  const handleEdit = (category: Category) => {
    console.log("Editing category:", category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    });
    setEditMode(true);
    setEditId(category.id);
  };
  
  // Cancel editing
  const handleCancel = () => {
    console.log("Canceling category edit");
    setFormData({ name: '', type: 'expense', color: '#1DB954' });
    setEditMode(false);
    setEditId(null);
  };
  
  // Delete a category
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    console.log(`Deleting category with ID ${id}`);
    setLoading(true);
    try {
      const { error } = await categoriesService.delete(id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Category deletion successful");
      showToast('Categoria excluída com sucesso!', 'success');
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir categoria';
      console.error("Error deleting category:", errorMessage);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="w-full">
          {/* Page Header - Container de 104px com conteúdo centralizado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                Categorias
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base lg:text-lg">
                Organize suas transações por categoria
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-text-secondary">Carregando categorias...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6 content-box">
                  <div className="text-red-600 dark:text-red-400 text-center">
                    <p className="mb-4">{error}</p>
                    <button 
                      onClick={loadCategories} 
                      className="text-primary underline hover:opacity-80 transition-opacity"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="content-box p-6">
                  {categories.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <p className="text-text-secondary text-lg mb-2">
                        Nenhuma categoria encontrada
                      </p>
                      <p className="text-text-muted text-sm">
                        Crie sua primeira categoria para organizar suas transações
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {categories.map((category) => (
                        <div key={category.id} className="bg-card border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(category)}
                                className="text-text-muted hover:text-text transition-colors p-1"
                                title="Editar categoria"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Excluir categoria"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <h3 className="font-medium text-text mb-1">{category.name}</h3>
                          <p className="text-text-secondary text-sm capitalize">{category.type}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </SidebarLayout>
    </ProtectedRoute>
  );
} 