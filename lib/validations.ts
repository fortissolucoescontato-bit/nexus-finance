/**
 * Schemas de validação usando Zod
 * 
 * Centraliza todas as validações do sistema em um único lugar
 * para facilitar manutenção e garantir consistência
 */

import { z } from 'zod';

/**
 * Schema para validação de email
 */
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .toLowerCase()
  .trim();

/**
 * Schema para validação de senha
 */
export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha deve ter no máximo 100 caracteres');

/**
 * Schema para validação de nome completo
 */
export const fullNameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .trim();

/**
 * Schema para validação de nome de organização
 */
export const organizationNameSchema = z
  .string()
  .min(2, 'O nome da organização deve ter pelo menos 2 caracteres')
  .max(100, 'O nome da organização deve ter no máximo 100 caracteres')
  .trim();

/**
 * Schema para validação de login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema para validação de registro
 */
export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema para validação de criação de organização
 */
export const createOrganizationSchema = z.object({
  organizationName: organizationNameSchema,
});

/**
 * Schema para validação de atualização de organização
 */
export const updateOrganizationSchema = z.object({
  organizationId: z.string().uuid('ID da organização inválido'),
  newName: organizationNameSchema,
});

/**
 * Schema para validação de nome de conta
 */
export const accountNameSchema = z
  .string()
  .min(2, 'O nome da conta deve ter pelo menos 2 caracteres')
  .max(100, 'O nome da conta deve ter no máximo 100 caracteres')
  .trim();

/**
 * Schema para validação de tipo de conta
 */
export const accountTypeSchema = z.enum(['bank', 'cash', 'credit'], {
  errorMap: () => ({ message: 'Tipo de conta inválido' }),
});

/**
 * Schema para validação de criação de conta
 */
export const createAccountSchema = z.object({
  name: accountNameSchema,
  type: accountTypeSchema,
  organizationId: z.string().uuid('ID da organização inválido'),
});

/**
 * Schema para validação de atualização de conta
 */
export const updateAccountSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
  name: accountNameSchema.optional(),
  type: accountTypeSchema.optional(),
});

/**
 * Schema para validação de nome de categoria
 */
export const categoryNameSchema = z
  .string()
  .min(2, 'O nome da categoria deve ter pelo menos 2 caracteres')
  .max(100, 'O nome da categoria deve ter no máximo 100 caracteres')
  .trim();

/**
 * Schema para validação de tipo de categoria
 */
export const categoryTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Tipo de categoria inválido' }),
});

/**
 * Schema para validação de criação de categoria
 */
export const createCategorySchema = z.object({
  name: categoryNameSchema,
  type: categoryTypeSchema,
  organizationId: z.string().uuid('ID da organização inválido'),
  icon: z.string().optional(),
});

/**
 * Schema para validação de atualização de categoria
 */
export const updateCategorySchema = z.object({
  categoryId: z.string().uuid('ID da categoria inválido'),
  name: categoryNameSchema.optional(),
  type: categoryTypeSchema.optional(),
  icon: z.string().optional(),
});

/**
 * Schema para validação de valor monetário (em centavos)
 */
export const amountSchema = z
  .number()
  .int('O valor deve ser um número inteiro')
  .min(-999999999999, 'Valor muito baixo')
  .max(999999999999, 'Valor muito alto');

/**
 * Schema para validação de criação de transação
 */
export const createTransactionSchema = z.object({
  accountId: z.string().uuid('ID da conta inválido'),
  categoryId: z.string().uuid('ID da categoria inválido').optional(),
  amount: amountSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  type: categoryTypeSchema,
  status: z.enum(['pending', 'paid'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }).default('paid'),
  organizationId: z.string().uuid('ID da organização inválido'),
});

/**
 * Schema para validação de atualização de transação
 */
export const updateTransactionSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
  accountId: z.string().uuid('ID da conta inválido').optional(),
  categoryId: z.string().uuid('ID da categoria inválido').optional().nullable(),
  amount: amountSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional().nullable(),
  type: categoryTypeSchema.optional(),
  status: z.enum(['pending', 'paid']).optional(),
});

/**
 * Tipos TypeScript derivados dos schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

