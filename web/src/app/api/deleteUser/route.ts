import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/fetch-api';

export async function DELETE(req: NextRequest) {
	const cookiesStore = await cookies();  
  const userToken = cookiesStore.get('userToken')?.value;

  try {
		if(!userToken) {
			throw new Error('Usuário não possui token');
		}
		
		const searchParams = req.nextUrl.searchParams;
		const id = searchParams.get('id');
		const data = await api(`/user/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${userToken}`
			}
		});

		return NextResponse.json({ 
			...data
		});
  } catch (error) {
    console.error(error);
  }
}