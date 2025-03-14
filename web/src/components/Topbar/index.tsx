'use client'

import { memo, useEffect, useState } from "react";
import { Dispatch, UnknownAction } from '@reduxjs/toolkit/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { logout } from "@/utils/logout";
import { UserType } from "@/interface/User";

interface Props {
  emailUser: string;
	nameUser: string;
  roleUser: UserType['role'];
	dispatch: Dispatch<UnknownAction>;
	router: AppRouterInstance;
}

function Topbar({
	nameUser,
  emailUser,
	router,
  roleUser,
	dispatch
}: Props) {

  const [show, setShow] = useState(false);

	const handleLogout = () => {
    logout(dispatch, router);
  };

  const handleOptionSelected = (optionSelected: string) => {
    switch(optionSelected) {
      case 'lu':
        router.push('/users');
        break;
      case 'mp':
        router.push('/profile');
        break;
      case 'exit':
        handleLogout();
        break;
    }
  }

  useEffect(() => {
    setShow((nameUser || emailUser) ? true : false);
  }, [nameUser, emailUser])
  
	return (
		(show) && <nav className="absolute left-0 top-0 w-full py-6 px-18 shadow-lg bg-[#5b5f72] border-b-gray-500 border-b-[1px]">
      <div className="flex items-center w-full justify-between">
        <h5>{`Bem-vindo ${nameUser || emailUser}`}</h5>
        {roleUser === 'USER' ? <button 
          className="border-0! p-0! shadow-none!"
          onClick={handleLogout}
        >
            <h5 className="font-normal!">
              Sair
            </h5>            
        </button> : <select 
          className={`outline-0 w-auto max-w-[85px] cursor-pointer`}
          onChange={(e) => {
            if(!e?.target?.value) return;
            handleOptionSelected(e?.target?.value);
          }}
        >
          <option value="">Opções</option>
          <option value="lu">Lista de Usuários</option>
          <option value="mp">Meu Perfil</option>
          <option value="exit">Sair</option>
        </select>}
      </div>
    </nav>
	)

}

export default memo(Topbar)