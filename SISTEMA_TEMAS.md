# 🎨 Sistema de Temas Dark/Light - EuGastei

## 📋 Visão Geral

Sistema completo de temas que permite alternância automática entre modo escuro e claro em toda a plataforma, usando **tokens semânticos** e **CSS Custom Properties** com Tailwind CSS.

## 🎯 Características Principais

- ✅ **Tokens Semânticos**: Classes como `bg-background`, `text-text`, `border-border`
- ✅ **CSS Custom Properties**: Variáveis CSS que mudam automaticamente com o tema
- ✅ **Tailwind Integration**: Integração completa com Tailwind CSS
- ✅ **Persistência**: Salvamento da preferência do usuário no localStorage
- ✅ **Sistema Detection**: Detecção automática da preferência do sistema
- ✅ **Transições Suaves**: Animações ao alternar entre temas
- ✅ **Hook Personalizado**: `useTheme()` para gerenciamento de estado

## 🎨 Cores Definidas

### Background Principal
- **Light**: `#FFFFFF` (Branco)
- **Dark**: `#0A0B0E` (Preto suave)

### Sidebar
- **Light**: `#F9FAFB` (Cinza muito claro)
- **Dark**: `#121317` (Cinza escuro)

### Cards e Caixas
- **Light**: `#F9FAFB` (Cinza muito claro)
- **Dark**: `#121317` (Cinza escuro)

### Bordas
- **Light**: `#E5E7EB` (Cinza claro)
- **Dark**: `#2C2D31` (Cinza médio)

### Hierarquia de Textos

#### Texto Principal
- **Light**: `#01040B` (Preto profundo)
- **Dark**: `#F9FAFB` (Branco suave)

#### Texto Secundário
- **Light**: `#141519` (Cinza escuro)
- **Dark**: `#D1D1D6` (Cinza claro)

#### Texto Muted
- **Light**: `#9CA3AF` (Cinza médio)
- **Dark**: `#8A8A8E` (Cinza médio escuro)

### Cores de Marca (Inalteradas)
- **Primary**: `#007AFF` (Azul padrão)
- **Success**: `#52CC4B` (Verde)
- **Danger**: `#CC4B4B` (Vermelho)
- **Warning**: `#FBBF24` (Amarelo)

## 🛠️ Implementação Técnica

### 1. Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens semânticos que se adaptam ao tema
        background: 'rgb(var(--color-background) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        
        // Tokens de texto
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        
        // Cores de marca
        primary: '#007AFF',
        success: '#52CC4B',
        danger: '#CC4B4B',
        warning: '#FBBF24'
      }
    }
  }
}
```

### 2. CSS Custom Properties

```css
/* app/app.css */
:root {
  /* Light Mode (Default) */
  --color-background: 255 255 255;
  --color-sidebar: 249 250 251;
  --color-card: 249 250 251;
  --color-border: 229 231 235;
  --color-text: 1 4 11;
  --color-text-secondary: 20 21 25;
  --color-text-muted: 156 163 175;
}

/* Dark Mode */
.dark {
  --color-background: 10 11 14;
  --color-sidebar: 18 19 23;
  --color-card: 18 19 23;
  --color-border: 44 45 49;
  --color-text: 249 250 251;
  --color-text-secondary: 209 209 214;
  --color-text-muted: 138 138 142;
}
```

### 3. Hook useTheme

```typescript
// app/hooks/useTheme.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Verificar preferência salva ou do sistema
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemPreference);
    }
  }, []);

  useEffect(() => {
    // Aplicar tema ao documento
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
```

## 📝 Guia de Uso

### Classes Semânticas Disponíveis

#### Backgrounds
```jsx
<div className="bg-background">Background principal</div>
<div className="bg-sidebar">Background da sidebar</div>
<div className="bg-card">Background de cards</div>
```

#### Textos
```jsx
<h1 className="text-text">Título principal</h1>
<p className="text-text-secondary">Texto secundário</p>
<span className="text-text-muted">Texto desbotado</span>
```

#### Bordas
```jsx
<div className="border border-border">Elemento com borda</div>
```

#### Cores de Marca
```jsx
<button className="bg-primary text-white">Botão primário</button>
<span className="text-success">Texto de sucesso</span>
<span className="text-danger">Texto de erro</span>
<span className="text-warning">Texto de aviso</span>
```

### Exemplo de Componente

```jsx
function ExampleCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="text-text text-xl font-semibold mb-2">
        Título do Card
      </h2>
      <p className="text-text-secondary mb-4">
        Descrição secundária do conteúdo
      </p>
      <div className="flex justify-between items-center">
        <span className="text-text-muted text-sm">
          Informação adicional
        </span>
        <button className="bg-primary text-white px-4 py-2 rounded">
          Ação
        </button>
      </div>
    </div>
  );
}
```

### Uso do Hook

```jsx
import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="bg-card border border-border p-2 rounded"
    >
      {theme === 'light' ? '🌙' : '☀️'}
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}
```

## 🔄 Migração de Classes Antigas

As seguintes classes foram migradas automaticamente:

| Classe Antiga | Nova Classe |
|---------------|-------------|
| `text-foreground` | `text-text` |
| `text-foreground-secondary` | `text-text-secondary` |
| `text-foreground-muted` | `text-text-muted` |
| `bg-foreground` | `bg-text` |
| `bg-card-secondary` | `bg-card` |
| `placeholder-foreground-muted` | `placeholder-text-muted` |

## ✨ Vantagens do Sistema

1. **Escalabilidade**: Adicionar novos temas é simples
2. **Manutenibilidade**: Um local central para gerenciar cores
3. **Consistência**: Garante visual uniforme em toda aplicação
4. **Performance**: Transições CSS nativas são otimizadas
5. **Acessibilidade**: Respeita preferências do sistema
6. **Developer Experience**: Classes semânticas são mais intuitivas

## 🚀 Próximos Passos

- [ ] Adicionar mais variações de tema (ex: tema azul, verde)
- [ ] Implementar tema automático baseado no horário
- [ ] Adicionar suporte a cores personalizadas
- [ ] Criar painel de personalização de temas
- [ ] Implementar tema de alto contraste para acessibilidade

## 🎯 Resultado Final

✅ **Sistema de temas completo e escalável implementado**
✅ **Todas as páginas e componentes migrados**
✅ **Toggle funcional entre dark/light mode**
✅ **Persistência de preferência do usuário**
✅ **Transições suaves entre temas**
✅ **Base sólida para futuras expansões**

O sistema está pronto para uso em produção e fornece uma base robusta para o gerenciamento de temas na plataforma EuGastei! 