'use client';

/**
 * Formulário para editar transação existente
 * 
 * Similar ao CreateTransactionForm, mas pré-preenche os campos
 * com os dados da transação atual
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTransaction } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';
import { 
  Save, 
  Wallet, 
  Tag, 
  DollarSign, 
  Calendar, 
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  date: string;
  description: string | null;
  type: 'income' | 'expense';
  status: 'pending' | 'paid';
}

interface EditTransactionFormProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditTransactionForm({
  transaction,
  accounts,
  categories,
  onSuccess,
  onCancel,
}: EditTransactionFormProps) {
  // Estados do formulário - inicializados com os valores da transação
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [categoryId, setCategoryId] = useState(transaction.category_id || '');
  // Converte valor de centavos para reais (valor absoluto para exibição)
  const [amount, setAmount] = useState((Math.abs(transaction.amount) / 100).toFixed(2));
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [status, setStatus] = useState<'pending' | 'paid'>(transaction.status);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualiza categoria quando o tipo muda (para filtrar categorias)
  useEffect(() => {
    // Se a categoria atual não é do tipo selecionado, limpa a seleção
    const currentCategory = categories.find(c => c.id === categoryId);
    if (currentCategory && currentCategory.type !== type) {
      setCategoryId('');
    }
  }, [type, categoryId, categories]);

  // Carrega telefone salvo (se existir) para esta transação
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(`transaction_phone_${transaction.id}`);
    if (stored) {
      setPhone(stored);
    }
  }, [transaction.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Converte valor de reais para centavos
      const amountInCents = Math.round(parseFloat(amount) * 100);

      if (isNaN(amountInCents) || amountInCents <= 0) {
        setError('Valor inválido');
        setIsLoading(false);
        return;
      }

      // Prepara os dados de atualização
      // Só envia campos que mudaram ou todos para garantir atualização completa
      const updates: {
        accountId?: string;
        categoryId?: string | null;
        amount?: number;
        date?: string;
        description?: string | null;
        type?: 'income' | 'expense';
        status?: 'pending' | 'paid';
      } = {};

      // Só adiciona campos que mudaram (ou todos para garantir)
      if (accountId !== transaction.account_id) updates.accountId = accountId;
      if (categoryId !== (transaction.category_id || '')) {
        updates.categoryId = categoryId || null;
      }
      if (amountInCents !== Math.abs(transaction.amount)) updates.amount = amountInCents;
      if (date !== transaction.date) updates.date = date;
      if (description !== (transaction.description || '')) {
        updates.description = description.trim() || null;
      }
      if (type !== transaction.type) updates.type = type;
      if (status !== transaction.status) updates.status = status;

      // Chama a Server Action para atualizar
      const result = await updateTransaction(transaction.id, updates);

      if (result.success) {
        // Sucesso - fecha o modal e recarrega
        onSuccess();
      } else {
        // Erro - exibe mensagem
        setError(result.error || 'Erro ao atualizar transação');
        logger.error('Erro ao atualizar transação', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      logger.error('Erro inesperado ao atualizar transação', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra categorias por tipo selecionado
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção: Tipo, Status e Conta */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informações Básicas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="edit-transaction-type" className="flex items-center gap-2 text-sm font-medium">
              {type === 'income' ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              Tipo
            </Label>
            <select
              id="edit-transaction-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'income' | 'expense');
                setCategoryId(''); // Reseta categoria ao mudar tipo
              }}
              disabled={isLoading}
              className={`flex h-11 w-full rounded-lg border-2 transition-all ${
                type === 'income'
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20'
                  : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20'
              } px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                type === 'income'
                  ? 'focus-visible:ring-emerald-500'
                  : 'focus-visible:ring-red-500'
              } disabled:cursor-not-allowed disabled:opacity-50`}
              required
              aria-label="Tipo de transação"
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          {/* Status - agora ao lado do Tipo */}
          <div className="space-y-2">
            <Label htmlFor="edit-transaction-status" className="flex items-center gap-2 text-sm font-medium">
              {status === 'paid' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
              Status
            </Label>
            <select
              id="edit-transaction-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
              disabled={isLoading}
              className={`flex h-11 w-full rounded-lg border-2 transition-all px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                status === 'paid'
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 focus-visible:ring-emerald-500'
                  : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 focus-visible:ring-amber-500'
              }`}
              aria-label="Status"
            >
              <option value="paid">Pago/Recebido</option>
              <option value="pending">Fiado/Pendente</option>
            </select>
          </div>

          {/* Conta */}
          <div className="space-y-2">
            <Label htmlFor="edit-transaction-account" className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Conta
            </Label>
            <select
              id="edit-transaction-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isLoading || accounts.length === 0}
              className="flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-blue-300 dark:hover:border-blue-600"
              required
              aria-label="Conta"
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Seção: Categoria */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <Tag className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Classificação</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-transaction-category" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Categoria (opcional)
            </Label>
            <select
              id="edit-transaction-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isLoading || filteredCategories.length === 0}
              className="flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-purple-300 dark:hover:border-purple-600"
              aria-label="Categoria"
            >
              <option value="">Sem categoria</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Seção: Valor e Data */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <DollarSign className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Valor e Data</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-transaction-amount" className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Valor (R$)
            </Label>
            <div className="relative">
              <Input
                id="edit-transaction-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isLoading}
                aria-label="Valor da transação"
                className="h-11 pl-10 text-lg font-semibold border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-lg"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">R$</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-transaction-date" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Data
            </Label>
            <Input
              id="edit-transaction-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
              aria-label="Data da transação"
              className="h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-lg font-medium"
            />
          </div>
        </div>
      </div>

      {/* Seção: Descrição */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-transaction-description" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Descrição (opcional)
          </Label>
          <Input
            id="edit-transaction-description"
            type="text"
            placeholder="Ex: Compra no supermercado, pagamento de salário, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            disabled={isLoading}
            aria-label="Descrição da transação"
            className="h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description.length}/500 caracteres
          </p>
        </div>

        {/* Telefone da cliente para cobrança no WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="edit-transaction-phone" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            Telefone da Cliente (para cobrança no WhatsApp)
          </Label>
          <Input
            id="edit-transaction-phone"
            type="tel"
            placeholder="DDD + número (somente dígitos)"
            value={phone}
            onChange={(e) => {
              const raw = e.target.value;
              const cleaned = raw.replace(/\D/g, '');
              setPhone(cleaned);
              if (typeof window !== 'undefined') {
                if (cleaned) {
                  localStorage.setItem(`transaction_phone_${transaction.id}`, cleaned);
                } else {
                  localStorage.removeItem(`transaction_phone_${transaction.id}`);
                }
              }
            }}
            maxLength={20}
            disabled={isLoading}
            aria-label="Telefone da cliente para cobrança no WhatsApp"
            className="h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-500 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Esse número será usado no botão <strong>“Cobrar no Zap”</strong> da lista de vendas.
          </p>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 transition-all">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 h-11 font-medium"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !accountId || !amount}
          className="px-6 h-11 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

