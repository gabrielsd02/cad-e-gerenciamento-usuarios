import { getUserInfo } from '@/utils/getUserInfo';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
	const cookiesStore = await cookies();  
  const token = cookiesStore.get('userToken')?.value;

  try {
		if(!token) {
			throw new Error('Usuário não possui token');
		}

    const response = await getUserInfo(token);
		if (!response?.user?.id) {
			throw new Error('Usuário não encontrado');
		}

		return NextResponse.json({ 
			user: response.user	
		});
  } catch (error) {
    console.error(error);
  }
}