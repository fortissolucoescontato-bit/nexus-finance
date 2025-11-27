/**
 * Layout para rotas protegidas (app)
 * 
 * Este layout envolve todas as páginas autenticadas e inclui a sidebar de navegação.
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica autenticação no layout
  const supabase = await createServerComponentClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Se não estiver autenticado, redireciona para login
  if (error || !user) {
    redirect('/login');
  }

  // Busca o perfil do usuário para exibir na sidebar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const userName = profile?.full_name || user.email || 'Usuário';

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Sidebar */}
      <AppSidebar userName={userName} />

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto ml-64">
        {children}
      </main>
    </div>
  );
}

