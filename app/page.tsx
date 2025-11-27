/**
 * Landing Page - Nexus Finance
 * 
 * Página inicial do sistema que apresenta o produto de forma profissional.
 * 
 * Comportamento:
 * - Usuários autenticados → Redireciona para /dashboard
 * - Usuários não autenticados → Exibe a landing page
 */

import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wallet,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  CreditCard,
  Lock,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

/**
 * Componente da página raiz
 * 
 * Verifica se o usuário está autenticado:
 * - Se SIM: redireciona para dashboard (não mostra landing page)
 * - Se NÃO: exibe a landing page profissional
 */
export default async function HomePage() {
  // Cria o cliente Supabase para verificar autenticação no servidor
  const supabase = await createServerComponentClient();

  // Busca os dados do usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se o usuário já estiver autenticado, redireciona para o dashboard
  // (usuários logados não precisam ver a landing page)
  if (user) {
    redirect('/dashboard');
  }

  // Se não estiver autenticado, exibe a landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.05] bg-[size:20px_20px]" />
      
      {/* Navegação superior */}
      <nav className="relative z-10 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nexus Finance
              </span>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Badge de destaque */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            <span>Sistema Multi-Tenant Profissional</span>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestão Financeira
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Inteligente e Segura
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Controle suas finanças pessoais e empresariais com segurança total.
            Sistema multi-organização com isolamento completo de dados.
          </p>

          {/* CTAs principais */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6 border-2"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* Estatísticas/Métricas (opcional - pode ser adicionado depois) */}
        </div>
      </section>

      {/* Seção de Funcionalidades */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tudo que você precisa para
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> gerenciar suas finanças</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Funcionalidades profissionais pensadas para facilitar sua vida financeira
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Organização */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Multi-Organização</CardTitle>
              <CardDescription>
                Gerencie múltiplas organizações (pessoal e empresarial) em um único lugar,
                com isolamento completo de dados.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2: Segurança */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Máxima Segurança</CardTitle>
              <CardDescription>
                Row Level Security (RLS) garantindo que cada organização veja apenas
                seus próprios dados. Zero vazamento de informação.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3: Gestão de Contas */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Contas Bancárias</CardTitle>
              <CardDescription>
                Organize suas contas (bancárias, dinheiro, cartões) e tenha controle
                total sobre cada fonte de recursos.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 4: Categorias */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Categorias Inteligentes</CardTitle>
              <CardDescription>
                Organize receitas e despesas por categorias personalizadas.
                Análise completa do seu fluxo financeiro.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 5: Transações */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Gestão de Transações</CardTitle>
              <CardDescription>
                Registre todas as suas transações de forma simples e rápida.
                Histórico completo com busca e filtros avançados.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 6: Dashboard */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Dashboard Completo</CardTitle>
              <CardDescription>
                Visualize resumos financeiros, gráficos e métricas importantes
                para tomar decisões inteligentes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Por que escolher o Nexus Finance?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Benefício 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Isolamento Total de Dados
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cada organização possui seus dados completamente isolados.
                  Segurança garantida com Row Level Security (RLS).
                </p>
              </div>
            </div>

            {/* Benefício 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Interface Moderna
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Design profissional e intuitivo. Fácil de usar, mesmo para
                  quem não tem experiência com sistemas financeiros.
                </p>
              </div>
            </div>

            {/* Benefício 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Totalmente Responsivo
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Acesse de qualquer dispositivo - desktop, tablet ou celular.
                  Seus dados sempre ao alcance.
                </p>
              </div>
            </div>

            {/* Benefício 4 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tecnologia de Ponta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Construído com Next.js 15, React 19 e Supabase.
                  Performance e segurança em primeiro lugar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto para começar?
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Crie sua conta gratuitamente e comece a gerenciar suas finanças hoje mesmo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6 font-semibold"
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                className="border-2 border-white bg-transparent text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6 font-semibold"
              >
                Fazer Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nexus Finance
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Nexus Finance. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

