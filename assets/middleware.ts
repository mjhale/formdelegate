import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const protectedRoutes = [
  '/account',
  '/dashboard',
  '/forms',
  '/submissions',
  '/support',
  '/user-confirmation/request',
];
const publicRoutes = ['/login', '/signup', '/reset-password'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.find((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.find((route) => path.startsWith(route));

  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  if (isProtectedRoute && (!accessToken || !userId)) {
    const redirectParams = new URLSearchParams([['destination', path]]);
    const loginUrl = new URL(`/login?${redirectParams}`, req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isPublicRoute &&
    accessToken &&
    userId &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
