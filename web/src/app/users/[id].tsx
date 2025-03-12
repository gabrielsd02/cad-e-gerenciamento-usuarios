'use client'

import { useRouter } from "next/navigation";

export default function FormularioUsuario() {
  const router = useRouter();
  const { id } = router.query; 

  return (
    <div>
      <h1>Formulário do Usuário</h1>
      <p>ID do usuário: {id}</p>
      <form>
        <label>Nome:</label>
        <input type="text" placeholder="Digite o nome" />
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
