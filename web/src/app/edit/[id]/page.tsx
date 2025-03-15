'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { api } from "@/fetch-api";
import { setLoading } from "@/redux/slices/loadingSlice";
import { RootState } from "@/redux/store";
import { returnToast } from "@/utils/toast";
import { UserType } from "@/interface/User";
import FormUser from "@/components/FormUser";

export default function Edit({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter();
  const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user);

	const [userToken, setUserToken] = useState(null);
	const [email, setEmail] = useState<string | null>(null);
	const [name, setName] = useState<string | null>(null);
	const [role, setRole] = useState<UserType['role']>('USER');
	const [dateBirth, setDateBirth] = useState<Date | null>(null);
	const [phone, setPhone] = useState<string | null>(null);
	const [errors, setErrors] = useState<string[]>([]);

	async function save() {
		dispatch(setLoading(true));
 
		const id = (await params).id;
		const url = `/user/${id}`;
		const paramsBody = {
			name,			
			dateBirth,
			phone
		} as {
			name: string;
			dateBirth: Date,
			phone: string,
			role?: UserType['role']
		};
		if(user.role === 'ADMIN') {
			paramsBody['role'] = role;
		}
		
		try {
			const response = await api(url, {
				method: 'PUT',
				body: JSON.stringify({...paramsBody}),
				headers: {
					Authorization: `Bearer ${userToken}`,
				}
			});
			returnToast(response.message, 'success');
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
				returnToast('Erro! Verifique as informações enviadas!', 'error');
			}
		} finally {
			dispatch(setLoading(false));
		}
	} 
	
	async function consultUserById(token: string) {
		dispatch(setLoading(true));

		const id = (await params).id;
		const url = `/user/${id}`;

		try {
			const data: UserType = await api(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			setEmail(data.email);
			setName(data.name);
			setRole(data.role);
			setDateBirth(data.dateBirth);
			setPhone(data.phone);
		} catch(e) {
			console.error(e);
			returnToast('Usuário não encontrado', 'error');
		} finally {	
			dispatch(setLoading(false));
		}
	}

	async function consultUserToken() {
		dispatch(setLoading(true));

		try {
			const response = await fetch('/api/getUserToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
				return response.json().then(errorData => {
          throw new Error(JSON.stringify(errorData));
        });
			}
			
      const responseJson = await response.json(); 
			setUserToken(responseJson.userToken);
			consultUserById(responseJson.userToken);
		} catch(e) {
			console.error(e);
			returnToast('Erro de autenticação! Por favor, refaça o login', 'error');
			router.push('/login');
		} finally {
			dispatch(setLoading(false));
		}
	}

	useEffect(() => {
		consultUserToken();
	}, [])

  if(!user) return <></>
  
  return (
    <div className="container gap-10">
      <h1>Editar</h1>
			{userToken && <FormUser 
				editing
				isAdmin={user?.role === 'ADMIN'}
				email={email}
				dateBirth={dateBirth}
				name={name}
				phone={phone}
				role={role}
				errors={errors}
				save={save}
				setRole={setRole}
				setName={setName}
				setEmail={setEmail}
				setPhone={setPhone}
				setErrors={setErrors}
				setDateBirth={setDateBirth}
			/>}
    </div>
  );
}
