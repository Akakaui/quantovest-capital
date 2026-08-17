import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isPublicRoute(pathname: string): boolean {
  if (
    pathname === '/' ||
    pathname === '/how-it-works' ||
    pathname === '/about' ||
    pathname === '/services' ||
    pathname === '/plans' ||
    pathname === '/faq' ||
    pathname === '/contact' ||
    pathname === '/login' ||
    pathname === '/signup'
  ) {
    return true;
  }
  if (pathname.startsWith('/legal/')) return true;
  if (pathname.startsWith('/api/plans')) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  return false;
}

function isInvestorRoute(pathname: string): boolean {
  if (pathname.startsWith('/dashboard')) return true;
  const investorApiRoutes = [
    '/api/deposits',
    '/api/withdrawals',
    '/api/kyc',
    '/api/uploads',
    '/api/notifications',
    '/api/profile',
    '/api/history',
    '/api/referrals',
    '/api/deposit-instructions',
  ];
  return investorApiRoutes.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/api/admin')) return true;
  return false;
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    return cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token') && cookie.value.length > 0;
  });
}

function isAdminFromSession(request: NextRequest): boolean {
  const sessionCookie = request.cookies.getAll().find((cookie) => {
    return cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token');
  });
  if (!sessionCookie) return false;

  try {
    const parts = sessionCookie.value.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    const role =
      payload?.app_metadata?.role ??
      payload?.user_metadata?.role ??
      payload?.role;
    return role === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);
  const isAdmin = isAdminFromSession(request);

  if (isPublicRoute(pathname)) {
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url));
    }
    return response;
  }

  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  if (isInvestorRoute(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
