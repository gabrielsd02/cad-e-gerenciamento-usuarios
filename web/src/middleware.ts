// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserInfo } from './utils/getUserInfo';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('userToken')?.value; 
  const publicRoutes = ['/login', '/register'];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
	
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = await getUserInfo(token);
  if (!response?.user?.id) {
    throw new Error('Erro ao consultar usuário');
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], 
};