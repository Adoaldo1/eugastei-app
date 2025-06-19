/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        '3xl': '1600px',
        '4xl': '1920px',
        '5xl': '2560px',
        'ultrawide': '2560px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      colors: {
        // Semantic color tokens that adapt to dark/light mode
        background: 'rgb(var(--color-background) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        
        // Text semantic tokens
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        
        // Brand colors (same in both themes)
        primary: '#007AFF',
        'primary-hover': '#0056CC',
        success: '#52CC4B',
        danger: '#CC4B4B',
        warning: '#FBBF24',
        
        // Primary button colors (adapt to dark/light mode)
        'primary-button': 'rgb(var(--color-primary-button) / <alpha-value>)',
        'primary-button-border': 'rgb(var(--color-primary-button-border) / <alpha-value>)',
        'primary-button-text': 'rgb(var(--color-primary-button-text) / <alpha-value>)',
        'primary-button-hover': 'rgb(var(--color-primary-button-hover) / <alpha-value>)',
        
        // Input background colors (adapt to dark/light mode)
        'input-bg': 'rgb(var(--color-input-bg) / <alpha-value>)',
        
        // Input border colors (adapt to dark/light mode)
        'input-border': 'rgb(var(--color-input-border) / <alpha-value>)',
        
        // Modal overlays
        'modal-overlay': 'rgba(0, 0, 0, 0.5)',
        'modal-bg': 'rgb(var(--color-background) / 0.95)',
        'modal-dark': 'rgba(0, 0, 0, 0.75)',
        
        // Legacy support (will be phased out)
        foreground: 'rgb(var(--color-text) / <alpha-value>)',
        'foreground-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'foreground-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
      },
      backgroundColor: {
        'modal-overlay': 'rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        'soft': '20px',
      }
    },
  },
  plugins: [],
} 