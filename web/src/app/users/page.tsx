'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { api } from "@/fetch-api";
import { UserType } from "@/interface/User";
import { setLoading } from "@/redux/slices/loadingSlice";
import { RootState } from "@/redux/store";
import { logout } from "@/utils/logout";
import { setUser } from "@/redux/slices/userSlice";

export default function UsersList() {
  const RECORDS_PER_PAGE = 30;

  const router = useRouter();

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [users, setUsers] = useState<UserType[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string | null>(null);
  
  async function consultUsers() {
    dispatch(setLoading(true));

    const url = '/users?';
    const params = {
      page,
      search,
      recordsPerPage: RECORDS_PER_PAGE
    };

    try {

      // const data = await api(url + new URLSearchParams(params as unknown as string).toString(), {
      //   method: 'GET'
      // });

    } catch(e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function consultUserInfo() {
    dispatch(setLoading(true));

    try {
      const response = await fetch('/api/getUserByToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
				return response.json().then(errorData => {
          throw new Error(JSON.stringify(errorData)); // Passa os detalhes do erro
        });
			}
			
      const responseJson = await response.json(); 
      dispatch(setUser(responseJson.user));

      // consultUsers();
    } catch(e: unknown) {
      console.error(e);
      logout(dispatch, router);
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  const handleLogout = () => {
    logout(dispatch, router);
  };

  useEffect(() => {
    if(!user) {
      consultUserInfo();
    } else {
      consultUsers();
    }
  }, [page, search]);

  if(!user) return <></>
  
  return (<>
    <nav className="absolute left-0 top-0 w-full p-8">
      <div className="flex items-center w-full justify-between">
        <h5 className="font-normal">
          Bem-vindo {user.name}
        </h5>
        <button onClick={handleLogout}>
          <h5 className="font-normal">
            Sair
          </h5>
        </button>
      </div>
    </nav>
    <div className="container mt-10!">
      <h1>Lista de Usuários</h1>
    </div>
  </>);
}
