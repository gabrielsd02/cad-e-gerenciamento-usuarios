import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
	const cookiesStore = await cookies();  
  const token = cookiesStore.get('userToken')?.value;

  try {
		if(!token) {
			throw new Error('Usuário não possui token');
		}    

		return NextResponse.json({ 
			userToken: token
		});
  } catch (error) {
    console.error(error);
  }
}