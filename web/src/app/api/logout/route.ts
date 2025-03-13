import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
	const cookiesStore = await cookies();  
	const response = NextResponse.json({ message: 'Logout realizado com sucesso '});
  cookiesStore.delete('userToken');

	return response;
}