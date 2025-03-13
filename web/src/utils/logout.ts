'use client';

import { setLoading } from '@/redux/slices/loadingSlice';
import { clearUser } from '@/redux/slices/userSlice';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function logout(
	dispatch: Dispatch<UnknownAction>, 
	router: AppRouterInstance
) {
  dispatch(setLoading(true));

  try {
    await fetch('/api/logout', {
      method: 'POST',
    });
    
    dispatch(clearUser());
    router.push('/login');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    dispatch(setLoading(false));
  }
};