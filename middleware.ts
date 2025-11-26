import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Atualiza o cookie da sessão (usando seu utilitário)
  // Isso garante que o token esteja válido antes de verificar o usuário
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição exceto:
     * 1. /api/ (rotas de API)
     * 2. /_next/ (arquivos estáticos do Next.js)
     * 3. /_static (arquivos estáticos dentro da pasta public)
     * 4. /_vercel (arquivos internos do Vercel)
     * 5. Arquivos com extensão (ex: favicon.ico, sitemap.xml, robots.txt)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

