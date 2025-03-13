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

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassoword] = useState("");
	const [errors, setErrors] = useState<string[]>([]);
	const [registering, setRegistering] = useState(false);

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

	async function register() {
		dispatch(setLoading(true));

		const url = '/register';

		try {
			const data = await api(url, {
				method: 'POST',
				body: JSON.stringify({
					email,
					password,
					name,
					confirmPassword
				})
			});

			const { message, accessToken, ...rest } = data;

			await handleRedirect(message, accessToken, rest as UserType);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch(e: any) {
			try {
				const errorData = JSON.parse(e?.message as string); 
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
      <h1>{registering ? "Registro" : "Login"}</h1>
      <h5 className="mt-5">Cadastro e Gerenciamento de Usuários</h5>
      <div className="flex flex-col m-auto gap-5 pb-8">
				{registering && <div className="flex flex-col gap-1">
					<label className="text-xl">Nome</label>
					<input 
						placeholder="Nome do usuário"
						type="text"
						className={`border-[1px] rounded-sm py-2 px-3 min-w-sm shadow-md ${errors.includes('name') ? 'border-red-600' : ''}`}
						value={name}
						onChange={({ target: { value } }) => {
							setName(value);
							setErrors((error) => error.filter(e => e !== 'name'));
						}}
						onKeyDown={(e) => {
							if(e.key === 'Enter') register();
						}}
					/>
				</div>}
				<div className="flex flex-col gap-1">
					<label className="text-xl">E-mail</label>
					<input 
						placeholder="Ex: usuario@gmail.com"
						type="email"
						className={`border-[1px] rounded-sm py-2 px-3 min-w-sm shadow-md ${errors.includes('email') ? 'border-red-600' : ''}`}
						value={email}
						onChange={({ target: { value } }) => {
							setEmail(value);
							setErrors((error) => error.filter(e => e !== 'email'));
						}}
						onKeyDown={(e) => {
							if(e.key === 'Enter') {
								return registering ? register() : logon();
							};
						}}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xl">Senha</label>
					<input 
						placeholder="******"
						type="password"
						className={`border-[1px] rounded-sm py-2 px-3 min-w-sm shadow-md ${errors.includes('password') ? 'border-red-600' : ''}`}
						value={password} 
						onChange={({ target: { value } }) => {
							setPassword(value);
							setErrors((error) => error.filter(e => e !== 'password'));
						}}
						onKeyDown={(e) => {
							if(e.key === 'Enter') {
								return registering ? register() : logon();
							};
						}}
					/>
				</div>
				{registering && <div className="flex flex-col gap-1">
					<label className="text-xl">Confirme a senha</label>
					<input 
						placeholder="******"
						type="password"
						className={`border-[1px] rounded-sm py-2 px-3 min-w-sm shadow-md ${errors.includes('confirmPassword') ? 'border-red-600' : ''}`}
						value={confirmPassword} 
						onChange={({ target: { value } }) => {
							setConfirmPassoword(value);
							setErrors((error) => error.filter(e => e !== 'confirmPassword'));
						}}
						onKeyDown={(e) => {
							if(e.key === 'Enter') register();
						}}
					/>
				</div>}
				<div className="mt-8 w-full flex items-center justify-between">
					<button 
						className="py-2 px-5 border-[1px] rounded-sm shadow-md"
						onClick={() => setRegistering(!registering)}
					>
						{registering ? "Cancelar" : "Registrar"}
					</button>
					<button 
						className="py-2 px-5 border-[1px] rounded-sm shadow-md"
						onClick={() => registering ? register() : logon()}
					>
						{registering ? "Cadastrar" : "Login"}
					</button>
				</div>
      </div>
    </div>
  );
}
