/**
 * Configuração do PostCSS para Next.js 15
 * 
 * PostCSS processa o CSS após o Tailwind aplicar suas transformações.
 * Este arquivo é necessário para o Tailwind CSS funcionar corretamente.
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

