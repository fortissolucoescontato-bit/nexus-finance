import type { NextConfig } from 'next';

/**
 * Configuração do Next.js 15
 * 
 * Este arquivo configura o comportamento do Next.js durante o build e runtime.
 * É opcional mas recomendado para projetos em produção.
 */

const nextConfig: NextConfig = {
  // Configurações de tipos TypeScript
  typescript: {
    // Ignora erros de tipo durante o build (útil para deploy rápido)
    // Em produção, você pode querer mudar para false
    ignoreBuildErrors: false,
  },
  
  // Configurações de ESLint
  eslint: {
    // Ignora erros de ESLint durante o build (útil para deploy rápido)
    // Em produção, você pode querer mudar para false
    ignoreDuringBuilds: false,
  },
  
  // Headers de segurança (opcional mas recomendado)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

