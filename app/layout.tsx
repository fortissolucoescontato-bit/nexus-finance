import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus Finance - Gestão Financeira',
  description: 'Sistema de gestão financeira multi-tenant',
};

/**
 * Root Layout do Next.js 15
 * 
 * Este é o layout raiz que envolve todas as páginas da aplicação.
 * No Next.js 15 com App Router, este arquivo é obrigatório.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

