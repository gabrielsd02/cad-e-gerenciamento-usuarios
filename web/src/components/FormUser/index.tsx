import { memo, useState } from "react";
import { FaEye, FaEyeSlash  } from "react-icons/fa6";

import { UserType } from "@/interface/User";

interface Props {
	errors: string[];
	email: string | null;
	name: string | null;
	role: UserType['role'];
	dateBirth: Date | null;
	isAdmin: boolean;
	phone: string | null;
	password?: string | null;
	editing?: boolean;
	setPassword?: React.Dispatch<React.SetStateAction<string | null>>
	setDateBirth: React.Dispatch<React.SetStateAction<Date | null>>
	setRole: React.Dispatch<React.SetStateAction<UserType['role']>>
	setEmail: React.Dispatch<React.SetStateAction<string | null>>;
	setName: React.Dispatch<React.SetStateAction<string | null>>;
	setPhone: React.Dispatch<React.SetStateAction<string | null>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	save():void;
}

function FormUser({
	isAdmin,
	editing,
	email,
	name,
	errors,
	role,
	dateBirth,
	phone,
	password,
	setPassword,
	setPhone,
	setDateBirth,
	setRole,
	setName,
	setEmail,
	save,
	setErrors,
}: Props) {
	const [showPassword, setShowPassword] = useState(false);

	const isValidDate = (d: unknown) => {
		return d instanceof Date && !isNaN(d as unknown as number);
	}

	return (		
		<div className="flex flex-col gap-5 max-w-[60%] m-auto min-h-[40%]">
			<form className="grid lg:grid-cols-2 md:grid-cols-1 gap-8 h-auto w-full">	
				<div className="lg:col-span-1 md:col-span-2">
					<label className="text-xl">E-mail</label>
					<input 	
						type="email" 
						className={`min-w-auto! w-full ${errors.includes('email') ? 'border-red-600' : ' '} ${editing ? 'opacity-50' : ''}`}
						placeholder="Ex: usuario@gmail.com"
						value={email ?? ''}
						disabled={editing ?? false}
						onChange={({ target: { value } }) => {
							setEmail(value);
							setErrors((error) => error.filter(e => e !== 'email'));
						}}
					/>
				</div>
				<div className="lg:col-span-1 md:col-span-2">
					<label className="text-xl">Nome</label>
					<input 
						type="text" 
						placeholder="Digite seu nome" 
						className={`min-w-auto! w-full ${errors.includes('name') ? 'border-red-600' : ''}`}
						value={name ?? ''}
						onChange={({ target: { value } }) => {
							setName(value);
							setErrors((error) => error.filter(e => e !== 'name'));
						}}
					/>
				</div>					
				
				<div className="lg:col-span-1 md:col-span-2">
					<label className="text-xl">Telefone</label>
					<input 
						type="tel" 
						className={`min-w-auto! w-full ${errors.includes('phone') ? 'border-red-600' : ''}`}
						placeholder="Digite seu número de telefone"
						maxLength={11}
						value={phone ?? ''}
						onChange={({ target: { value } }) => {
							setPhone(value);
							setErrors((error) => error.filter(e => e !== 'phone'));
						}} 
					/>
				</div>		
				<div className="lg:col-span-1 md:col-span-2">
					<label className="text-xl">Data de Nascimento</label>
					<input 
						type="date" 
						className={`min-w-auto! w-full ${errors.includes('date') ? 'border-red-600' : ''}`}
						value={!dateBirth ? '' : (isValidDate(new Date(dateBirth)) ? new Date(dateBirth).toISOString().split('T')[0] : '')}
						onChange={({ target: { value } }) => {
							setDateBirth(new Date(value));
							setErrors((error) => error.filter(e => e !== 'dateBirth'));
						}} 
					/>
				</div>				
				{(password !== undefined && setPassword !== undefined) && <div className="col-span-2">
					<label className="text-xl">Senha</label>
					<div className="flex gap-5">
						<input 
							type={showPassword ? 'text' : "password"}
							placeholder="******" 
							className={`min-w-auto! w-full ${errors.includes('password') ? 'border-red-600' : ''}`}
							value={password ?? ''}
							onChange={({ target: { value } }) => {
								setPassword(value);
								setErrors((error) => error.filter(e => e !== 'password'));
							}}
						/>						
						<button 
							className="shadow-none! border-0! cursor-default! p-0!"
							onClick={(e) => {
								e.preventDefault();
								setShowPassword(!showPassword)
							}}
						>
								{!showPassword ? <FaEye size={28}/> : <FaEyeSlash size={28}/>}
						</button>
					</div>
				</div>}
				<div className="col-span-2">
					<label className="text-xl">Nível de acesso</label>
					<select 
						className={`outline-0 border-[1px] rounded-sm py-2 px-3 shadow-md w-full ${!isAdmin ? 'opacity-50' : ''}`}
						disabled={!isAdmin}
						value={role}
						onChange={(e) => {
							if(!e?.target?.value) return;
							setRole(e.target.value as 'ADMIN' | 'MANAGER' | 'USER');
						}}
					>
						<option value="">Selecione um nível de acesso</option>
						<option value="ADMIN">ADMIN</option>
						<option value="MANAGER">GERENTE</option>
						<option value="USER">USUÁRIO</option>
					</select>
				</div>					
			</form>
			<div className="flex grow items-end justify-end mt-10">
					<button 
						type="button" 
						className="h-fit"
						onClick={save}
					>
						Salvar
					</button>
				</div>
		</div>
	)
}

export default memo(FormUser);