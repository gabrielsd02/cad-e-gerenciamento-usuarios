"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { api } from "@/fetch-api";
import { returnToast } from "@/utils/toast";
import { setLoading } from "@/redux/slices/loadingSlice";
import { setUser } from "@/redux/slices/userSlice";
import { UserType } from "@/interface/User";

export default function Login() {
	const router = useRouter();
	const dispatch = useDispatch();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<string[]>([]);

	const handleRedirect = async (message: string, userToken: string, userData: UserType) => {
		await fetch('/api/setToken', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: userToken }),
		});

		returnToast(message, "success");
		dispatch(setUser(userData));
		localStorage.setItem('user', JSON.stringify(userData));
		
		const response = await fetch('/api/redirect', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		});			
		
		if(!response?.ok) {
			throw new Error("Houve um erro inesperado, tente novamente");
		}

		const responseJson: {
			redirectPath: string
		} = await response.json();
		router.push(responseJson.redirectPath);
	}

  async function logon() {
    dispatch(setLoading(true));

		const url = '/login';

    try {
			const data = await api(url, {
				method: 'POST',
				body: JSON.stringify({
					email,
					password
				})
			});

			const { message, accessToken, ...rest } = data;

			await handleRedirect(message, accessToken, rest as UserType);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(e: any) {
			try {
				const errorData = JSON.parse(e.message); 
				if (errorData.statusCode === 400 && errorData.errors) {
					errorData.errors.forEach((err: { 
						property: string;
						errorMessage: string;
					}) => {
						setErrors((e) => e.concat(err.property));
						returnToast(err.errorMessage, 'error');
					});
				} else if (errorData.message){
					returnToast(errorData.message, 'error');
				} else {
					returnToast('Erro desconhecido, contate o suporte', 'error');
				}
			} catch(e: unknown) {	
				console.error(e);
				returnToast('Erro no login, verifique as informações enviadas!', 'error');
			}
    } finally {
      dispatch(setLoading(false));
    }
  }
  
  return (
    <div className="container">
      <h1>Login</h1>
      <h5 className="mt-5">Cadastro e Gerenciamento de Usuários</h5>
      <div className="flex flex-col m-auto gap-5 pb-8">
				<div className="flex flex-col gap-1">
					<label className="text-xl">E-mail</label>
					<input 
						placeholder="Ex: usuario@gmail.com"
						type="email"
						className={`${errors.includes('email') ? 'border-red-600' : ''}`}
						value={email}
						onChange={({ target: { value } }) => {
							setEmail(value);
							setErrors((error) => error.filter(e => e !== 'email'));
						}}
						onKeyDown={(e) => {
							if(e.key === 'Enter') {
								return logon();
							};
						}}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xl">Senha</label>
					<input 
						placeholder="******"
						type="password"
						className={`${errors.includes('password') ? 'border-red-600' : ''}`}
						value={password} 
						onChange={({ target: { value } }) => {
							setPassword(value);
							setErrors((error) => error.filter(e => e !== 'password'));
						}}
						onKeyDown={(e) => {
							if(e.key === 'Enter') {
								return logon();
							};
						}}
					/>
				</div>
				<div className="mt-8 w-full flex items-center justify-end">
					<button 
						onClick={logon}
					>
						Login
					</button>
				</div>
      </div>
    </div>
  );
}
