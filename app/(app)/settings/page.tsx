/**
 * Página de Configurações
 * 
 * Permite que o usuário gerencie todas as configurações da sua conta.
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Building2, Mail, Save } from 'lucide-react';
import { UpdateProfileForm } from './update-profile-form';
import { UpdateEmailForm } from './update-email-form';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações',
  description: 'Gerencie suas configurações de conta',
};

// Lazy load do componente de edição de organização
const EditOrgButton = dynamic(() => import('../dashboard/edit-org-button').then(mod => ({ default: mod.EditOrgButton })), {
  loading: () => <div className="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
});

export default async function SettingsPage() {
  const supabase = await createServerComponentClient();

  // Verifica autenticação
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Busca o perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  // Busca a organização do usuário
  const { data: membersData } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  let personalOrg = null;
  if (membersData?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, type')
      .eq('id', membersData.organization_id)
      .maybeSingle();
    
    personalOrg = org;
  }

  const userName = profile?.full_name || user.email || 'Usuário';
  const userEmail = profile?.email || user.email || '';

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Settings className="h-8 w-8" />
            </div>
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Gerencie todas as configurações da sua conta
          </p>
        </div>

        {/* ========== SEÇÃO: PERFIL DO USUÁRIO ========== */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil do Usuário</h2>
          
          <Card className="card-hover shadow-lg border-0 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <User className="h-5 w-5" />
                </div>
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize seu nome completo e email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário de Nome */}
              <UpdateProfileForm currentName={userName} />
              
              {/* Formulário de Email */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <UpdateEmailForm currentEmail={userEmail} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========== SEÇÃO: ORGANIZAÇÃO ========== */}
        {personalOrg && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organização</h2>
            
            <Card className="card-hover shadow-lg border-0 glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  Dados da Organização
                </CardTitle>
                <CardDescription>
                  Gerencie informações da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nome da Organização</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {personalOrg.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {personalOrg.type === 'personal' ? 'Pessoal' : 'Empresarial'}
                    </p>
                  </div>
                  <EditOrgButton 
                    organizationId={personalOrg.id} 
                    currentName={personalOrg.name}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========== SEÇÃO: INFORMAÇÕES ADICIONAIS ========== */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informações da Conta</h2>
          
          <Card className="card-hover shadow-lg border-0 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Mail className="h-5 w-5" />
                </div>
                Detalhes da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ID do Usuário</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                  {user.id}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Data de Criação</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(user.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

