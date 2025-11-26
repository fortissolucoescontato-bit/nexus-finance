/**
 * Utilitário para geração de slugs
 * 
 * Gera slugs únicos e consistentes para organizações e outros recursos
 */

/**
 * Gera um slug a partir de um texto
 * 
 * @param text - Texto a ser convertido em slug
 * @param userId - ID do usuário para tornar o slug único (opcional)
 * @returns Slug gerado
 * 
 * @example
 * generateSlug('Minha Organização', 'user-123') // 'minha-organizacao-user-123'
 */
export function generateSlug(text: string, userId?: string): string {
  // Remove espaços extras e converte para lowercase
  const trimmed = text.trim().toLowerCase();
  
  // Normaliza caracteres Unicode (remove acentos)
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Substitui caracteres não-alfanuméricos por hífen
  const slugBase = normalized.replace(/[^a-z0-9]+/g, '-');
  
  // Remove hífens do início e fim
  const cleaned = slugBase.replace(/^-+|-+$/g, '');
  
  // Adiciona sufixo único se userId fornecido
  if (userId) {
    return `${cleaned}-${userId.slice(0, 8)}`;
  }
  
  return cleaned;
}

