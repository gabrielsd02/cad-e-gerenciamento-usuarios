'use client'

import { logout } from "@/utils/logout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";

export default function Topbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

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
  
	return (
		(user?.name) && <nav className="absolute left-0 top-0 w-full py-6 px-18 shadow-lg bg-[#5b5f72] border-b-gray-500 border-b-[1px] z-[998]">
      <div className="flex items-center w-full justify-between">
        <h5>{`Bem-vindo ${user?.name || user?.email}`}</h5>
        {user?.role === 'USER' ? <button 
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