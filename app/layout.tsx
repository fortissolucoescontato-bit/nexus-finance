import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: {
    default: 'Nexus Finance - Gestão Financeira',
    template: '%s | Nexus Finance',
  },
  description: 'Sistema de gestão financeira multi-tenant com controle completo de organizações e transações',
  keywords: ['gestão financeira', 'finanças', 'multi-tenant', 'organizações', 'controle financeiro'],
  authors: [{ name: 'Nexus Finance' }],
  creator: 'Nexus Finance',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Nexus Finance',
    title: 'Nexus Finance - Gestão Financeira',
    description: 'Sistema de gestão financeira multi-tenant',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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

