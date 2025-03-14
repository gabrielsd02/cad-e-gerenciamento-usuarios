import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring'

import { api } from '@/fetch-api';

export async function GET(req: NextRequest) {
	const cookiesStore = await cookies();  
  const userToken = cookiesStore.get('userToken')?.value;

  try {
		if(!userToken) {
			throw new Error('Usuário não possui token');
		}

		const rawParams = req.url.split('?')[1];
    const params = querystring.parse(rawParams);
		const data = await api('/users?' + new URLSearchParams(params as unknown as string).toString(), {
			method: 'GET',
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