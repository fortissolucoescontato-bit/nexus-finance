/**
 * Componente Sidebar para aplicação
 * 
 * Sidebar de navegação principal com todas as funcionalidades do sistema.
 * Responsiva e acessível.
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Tag,
  Receipt,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  userName?: string;
}

/**
 * Itens do menu de navegação
 */
const menuItems = [
  {
    title: 'Resumo do Negócio',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do negócio',
  },
  {
    title: 'Meus Caixas',
    href: '/accounts',
    icon: Wallet,
    description: 'Carteira e contas',
  },
  {
    title: 'Categorias',
    href: '/categories',
    icon: Tag,
    description: 'Tipos de venda e gasto',
  },
  {
    title: 'Vendas e Gastos',
    href: '/transactions',
    icon: Receipt,
    description: 'Caderno de fiado',
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    description: 'Minha conta',
  },
];

export function AppSidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        redirect: 'follow',
      });
      // Redireciona independente do resultado
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout:', error);
      window.location.href = '/login';
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="flex h-full flex-col">
        {/* Logo e Nome do App */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Caderno de Fiado
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Para Consultoras e Sacoleiras
            </span>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Informações do Usuário e Logout */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {userName && (
            <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {userName.split(' ')[0]}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {userName}
                </p>
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  );
}

