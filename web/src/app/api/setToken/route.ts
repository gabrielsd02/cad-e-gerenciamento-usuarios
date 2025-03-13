import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookiesStore = await cookies();  
  const { token } = await request.json();

  cookiesStore.set('userToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 2, 
  });
  
  return NextResponse.json({ message: 'Token salvo' });
}