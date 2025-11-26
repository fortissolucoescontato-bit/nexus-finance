import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'Nexus Finance - Gestão Financeira',
  description: 'Sistema de gestão financeira multi-tenant',
};

/**
 * Root Layout do Next.js 15
 * 
 * Este é o layout raiz que envolve todas as páginas da aplicação.
 * No Next.js 15 com App Router, este arquivo é obrigatório.
 * 
 * O ErrorBoundary captura erros em toda a aplicação e exibe uma UI de fallback.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

