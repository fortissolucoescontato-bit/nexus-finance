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
 * Tipos TypeScript derivados dos schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

