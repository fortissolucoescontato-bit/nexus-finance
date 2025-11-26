import type { Config } from 'tailwindcss';

/**
 * Configuração do Tailwind CSS para Next.js 15
 * 
 * Esta configuração garante que o Tailwind CSS escaneie todos os arquivos
 * relevantes do projeto para encontrar classes CSS utilizadas.
 * 
 * IMPORTANTE: O array `content` define quais arquivos o Tailwind deve analisar.
 * Se você criar novos diretórios, adicione-os aqui para que os estilos funcionem.
 */

const config: Config = {
  // Modo dark mode baseado em classe (adicione 'dark' no HTML para ativar)
  darkMode: ['class'],
  
  // Define quais arquivos o Tailwind deve escanear para encontrar classes CSS
  // Se algum arquivo não estiver aqui, as classes Tailwind dentro dele não funcionarão
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  
  // Prefixo para classes (opcional - deixe vazio para não usar prefixo)
  prefix: '',
  
  // Tema personalizado do Tailwind
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Cores customizadas que são usadas pelos componentes Shadcn
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // Bordas arredondadas customizadas
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Animações customizadas (úteis para transições suaves)
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  
  // Plugins do Tailwind (opcional - pode ser adicionado depois)
  plugins: [],
};

export default config;

