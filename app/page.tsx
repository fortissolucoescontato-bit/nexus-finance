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
  Clock,
  DollarSign,
  Target,
  Sparkles,
  Star,
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
          {/* Badge de destaque - Prova Social */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-8 animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>🎉 Lançamento Beta - Primeiros Usuários Ganham Acesso Exclusivo</span>
          </div>

          {/* Título principal - Foco em benefício */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gray-900 dark:text-white">
              Controle Suas Finanças
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Em Minutos, Não Em Horas
            </span>
          </h1>

          {/* Subtítulo - Foco em problema/solução */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
            Pare de perder tempo com planilhas complicadas. Gerencie todas as suas finanças
            pessoais e da sua empresa em um único lugar, de forma simples e segura.
          </p>

          {/* Sub-badge de valor */}
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-10 font-semibold">
            ✅ 100% Gratuito • ✅ Sem Cartão de Crédito • ✅ Configure em 2 Minutos
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

          {/* Prova Social / Métricas */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">⚡</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Comece Agora</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">🔒</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">100% Seguro</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">💰</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Grátis Sempre</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Problemas que Resolve */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pare de Sofrer com
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Gestão Financeira</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Resolva os problemas mais comuns de quem precisa controlar dinheiro pessoal e empresarial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Pessoal e Empresarial */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Dinheiro Pessoal e da Empresa Separados</CardTitle>
              <CardDescription>
                Precisa gerenciar suas finanças pessoais E da sua empresa? Não precisa de dois sistemas.
                Tudo em um lugar, mas completamente separado e organizado.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2: Segurança */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Seus Dados São 100% Privados</CardTitle>
              <CardDescription>
                Nunca mais se preocupe com vazamento de dados. Seus dados financeiros são completamente
                privados e seguros. Ninguém além de você tem acesso.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3: Gestão de Contas */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Veja Todas as Suas Contas em Um Lugar</CardTitle>
              <CardDescription>
                Cansado de entrar em vários apps de banco? Centralize tudo: contas bancárias,
                dinheiro em espécie, cartões de crédito. Controle total em um só lugar.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 4: Categorias */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Descubra Para Onde Vai Seu Dinheiro</CardTitle>
              <CardDescription>
                Crie categorias personalizadas (alimentação, transporte, lazer...) e descubra
                exatamente onde você mais gasta. Tome decisões mais inteligentes.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 5: Transações */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Registre Receitas e Despesas em Segundos</CardTitle>
              <CardDescription>
                Esqueça planilhas complicadas. Registre cada entrada e saída de forma rápida e simples.
                Tenha histórico completo e busque qualquer transação em instantes.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 6: Dashboard */}
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Visualize Tudo de Forma Clara</CardTitle>
              <CardDescription>
                Dashboard visual com resumos financeiros e gráficos. Veja rapidamente
                quanto você tem, quanto ganhou e quanto gastou. Controle total na palma da mão.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA intermediário */}
        <div className="text-center mt-16">
          <Link href="/register">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6"
            >
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Seção: Por que Começar Agora */}
      <section className="relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Por Que Começar Hoje?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Quanto mais tempo você espera, mais dinheiro você pode estar perdendo de vista
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefício 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Configure em 2 Minutos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Não precisa ser técnico. Crie sua conta, adicione suas contas e comece a usar.
                Sem complicação, sem treinamento.
              </p>
            </div>

            {/* Benefício 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                100% Gratuito Para Sempre
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sem pegadinhas, sem período de teste. Totalmente gratuito, sempre.
                Não pedimos cartão de crédito.
              </p>
            </div>

            {/* Benefício 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Acesso Imediato
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Após criar sua conta, você já pode começar a usar. Não precisa esperar
                aprovação ou configuração complexa.
              </p>
            </div>

            {/* Benefício 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Primeiros Usuários Tem Vantagens
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Você está entre os primeiros! Isso significa que suas sugestões serão ouvidas
                e novas funcionalidades virão baseadas no que você precisa.
              </p>
            </div>

            {/* Benefício 5 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Seus Dados Seguros
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Dados criptografados e armazenados com segurança máxima.
                Você pode excluir tudo a qualquer momento.
              </p>
            </div>

            {/* Benefício 6 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Tome Decisões Melhores
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Quando você vê claramente para onde vai seu dinheiro, consegue economizar
                mais e investir melhor. Comece hoje!
              </p>
            </div>
          </div>

          {/* CTA no meio */}
          <div className="text-center mt-12">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6"
              >
                Quero Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
              Junte-se aos primeiros usuários e transforme a forma como você gerencia dinheiro.
              <br />
              <span className="font-semibold">100% Gratuito • Sem Cartão • Configure em 2 Minutos</span>
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

