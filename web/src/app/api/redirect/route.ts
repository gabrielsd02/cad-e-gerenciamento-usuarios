import { getUserInfo } from '@/utils/getUserInfo';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookiesStore = await cookies();  
  const token = cookiesStore.get('userToken');
  
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  
  try {
    const data = await getUserInfo(token.value);
    const user = data.user;

    let redirectPath = '/profile'
    
    if (user.role === 'ADMIN') {
      redirectPath = '/users';
    }

    return NextResponse.json({ redirectPath });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      redirectPath: '/login'
    })
  }
}