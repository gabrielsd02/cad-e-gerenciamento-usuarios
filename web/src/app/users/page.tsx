'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { api } from "@/api";
import { UserType } from "@/interface/User";
import { setLoading } from "@/redux/slices/loadingSlice";
import { RootState } from "@/redux/store";

export default function ListaUsuarios() {
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

  useEffect(() => {
    consultUsers();
  }, []);
  
  return (<>
    <nav>
      Bem-vindo usuário {user.name}
    </nav>
    <div className="container">
      <h1>Lista de Usuários</h1>
    </div>
  </>);
}
