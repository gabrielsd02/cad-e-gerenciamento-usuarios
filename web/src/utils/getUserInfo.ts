import { api } from "@/fetch-api";
import { UserType } from "@/interface/User";

export async function getUserInfo(token: string) {
  const response: { user: UserType } = await api('/auth', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response || !response.user) {
      throw new Error("Usuário não encontrado"); 
  }

  return {
    user: response.user
  };
}