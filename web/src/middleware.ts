import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserInfo } from './utils/getUserInfo';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('userToken')?.value; 
  const publicRoutes = ['/login', '/register'];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
	
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const response = await getUserInfo(token);
  if (!response?.user?.id) {
    throw new Error('Erro ao consultar usuário');
  }
  
  if(response.user.role === 'USER') {
    const routesPermitted = [...publicRoutes, '/', '/profile'];
    if(!routesPermitted.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], 
};