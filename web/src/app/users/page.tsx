'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { FaCirclePlus, FaPen, FaTrash, FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import { UserType } from "@/interface/User";
import { setLoading } from "@/redux/slices/loadingSlice";
import { RootState } from "@/redux/store";
import { returnToast } from "@/utils/toast";
import Modal from "@/components/Modal";

interface ResponseProps {
  currentPage: number;
  recordsPerPage: number;
  totalPages: number;
  totalRecords: number;
  users: UserType[];
}

export default function UsersList() {
  const RECORDS_PER_PAGE = 10;

  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userToDelete, setUserToDelete] = useState<null | UserType>(null);
  
  async function consultUsers() {
    dispatch(setLoading(true));

    const url = '/api/getUsers?';
    const params = {
      page,
      recordsPerPage: RECORDS_PER_PAGE
    } as {
      page: number;
      recordsPerPage: number;
      search: string;
    };
    if(search) {
      params['search'] = search
      params['page'] = 1;
    };

    try {
      const response = await fetch(url + new URLSearchParams(params as unknown as string).toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });			      
      if(!response?.ok) {
        throw new Error("Houve um erro inesperado, tente novamente");
      }

      const data: ResponseProps = await response.json();
      setUsers(data.users)
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalRecords);
    } catch(e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function deleteUser() {
    dispatch(setLoading(true));

    const url = '/api/deleteUser?';
    const params = {
      id: userToDelete!.id
    }

    try {
      const response = await fetch(url + new URLSearchParams(params as unknown as string).toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });			      
      if(!response?.ok) {
        throw new Error("Houve um erro inesperado, tente novamente");
      }

      const responseJson: {
        message: string
      } = await response.json();
      returnToast(responseJson.message, 'success');
      setUserToDelete(null);
      consultUsers();
    } catch(e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false));
    }
  }

  useEffect(() => {
    consultUsers();
  }, [page]);

  useEffect(() => {
    if(search) {
      const handler = setTimeout(() => {
        if(page === 1) {
          consultUsers();
        } else {
          setPage(1);
        }
      }, 500);

      return () => clearTimeout(handler);
    } else if(search === '') {
      setSearch(null);
      consultUsers();
    }
  }, [search])
  
  if(!user) return <></>
  
  return (<>
    <div className="container gap-10">
      <h1>Lista de Usuários</h1>
      {(user) && <div className="flex flex-col w-[80%] m-auto min-h-[60%] gap-5 overflow-x-hidden overflow-y-auto py-2">
        <div className="w-full flex justify-between gap-3 min-h-11">
          <input 
						type="text" 
						className={`w-full scale-none!`}
						placeholder="Pesquise um usuário por seu nome"
						value={search ?? ''}
						onChange={({ target: { value } }) => {
              setSearch(value);
						}} 
					/>
          {isAdmin && <button
            className="border-0! p-0! shadow-none!"
            onClick={() => router.push('/register')}
          >
            <FaCirclePlus 
              size={36}
            />
          </button>}
        </div>
        <table className={'w-full'}>
          <thead className="h-12">
            <tr className="border-b-[1px] border-t-[1px] first:border-l-[1px] last:border-r-[1px]">
              <th className="text-center min-w-[80px]! border-r-[1px]">Nome</th>
              <th className="text-center min-w-[50px] border-r-[1px]">Email</th>
              <th className="text-center min-w-[50px] border-r-[1px]">Nível de Acesso</th>
              <th className="text-center min-w-[100px]! border-r-[1px]">Criado em</th>
              {!isUser && <th className="text-right min-w-[50px]! pr-2">Opções</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="h-14 my-5 border-b-[1px]">
                <td className="text-center h-auto border-[1px]">{user.name}</td>
                <td className="text-center h-auto border-r-[1px]">{user.email}</td>
                <td className="text-center h-auto border-r-[1px]">{user.role}</td>
                <td className="text-center h-auto border-r-[1px]">
                  {new Date(user?.registrationDate).toLocaleDateString()} às {new Date(user?.registrationDate).toLocaleTimeString().slice(0, 5)}
                </td>
                {!isUser && <td className="h-auto border-r-[1px]">
                  <div className="flex gap-3 justify-end pr-3">
                   <button
                      className="border-0! p-0! shadow-none!"
                      onClick={() => router.push(`/edit/${user.id}`)}
                    >
                      <FaPen />
                    </button>
                    {isAdmin && <button
                      className="border-0! p-0! shadow-none!"
                      onClick={() => setUserToDelete(user)}
                    >
                      <FaTrash />
                    </button>}
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="w-full flex items-center justify-between min-h-20">
          <p>TOTAL REGISTROS: {totalRecords}</p>
          <div className="flex gap-3 items-center justify-center">
            <FaAngleLeft 
              size={32}
              className={`cursor-pointer ${page <= 1 ? 'opacity-30' : ''}`}
              onClick={() => {
                if(page <= 1) return;
                setPage(page - 1);
              }}
            />
            <h5 className="mb-1">{page}</h5>
            <FaAngleRight 
              size={32}
              className={`cursor-pointer ${page >= totalPages ? 'opacity-30' : ''}`}
              onClick={() => {
                if(page >= totalPages) return;
                setPage(page + 1);
              }}
            />
          </div>          
        </div>
      </div>}
    </div>
    {userToDelete && <Modal 
      message={`Você deseja excluir este usuário: ${userToDelete.name} ?`}
      title="Deletar"
      onClose={() => setUserToDelete(null)}
      onConfirm={deleteUser}
    />}
  </>);
}
