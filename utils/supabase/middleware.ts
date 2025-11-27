import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verifica o usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 REGRAS DE PROTEÇÃO DE ROTAS
  const url = request.nextUrl.clone();
  
  // 1. Se NÃO estiver logado e tentar acessar área protegida (rotas de /dashboard, /accounts, /categories, /transactions, /settings)
  const protectedRoutes = ['/dashboard', '/accounts', '/categories', '/transactions', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Se ESTIVER logado e tentar acessar área pública (/login, /register, /forgot-password)
  // Redireciona para o dashboard para não perder tempo
  // Nota: /reset-password pode ser acessado mesmo logado (caso o usuário queira redefinir)
  if (user) {
    const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
    if (publicRoutes.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

