import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

// Função para aplicar tema imediatamente (sem React)
const applyThemeToDOM = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Função para obter tema inicial (síncrona)
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'; // Dark como padrão no servidor
  
  try {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  } catch (error) {
    console.warn('Error reading theme from localStorage:', error);
  }
  
  // DARK como padrão principal (ao invés de seguir sistema)
  // Ainda considera preferência do sistema, mas favorece dark
  return 'dark'; // Sempre dark como padrão quando não há preferência salva
};

export function useTheme() {
  // Inicializar com tema correto imediatamente
  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = getInitialTheme();
    // Aplicar tema ao DOM imediatamente, antes do primeiro render
    if (typeof window !== 'undefined') {
      applyThemeToDOM(initialTheme);
    }
    return initialTheme;
  });

  useEffect(() => {
    // Aplicar tema ao DOM sempre que mudar
    applyThemeToDOM(theme);
    
    // Salvar preferência
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Aplicar imediatamente ao mudar
      applyThemeToDOM(newTheme);
      return newTheme;
    });
  };

  return { theme, toggleTheme };
}

// Script inline para aplicar tema antes do React carregar
export const themeScript = `
(function() {
  try {
    const savedTheme = localStorage.getItem('theme');
    // DARK como padrão principal (se não há tema salvo)
    const theme = savedTheme || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (error) {
    console.warn('Error applying initial theme:', error);
    // Fallback para dark em caso de erro
    document.documentElement.classList.add('dark');
  }
})();
`; 