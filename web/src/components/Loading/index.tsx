import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function Loading() {

  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  if (!isLoading) return null; 

  return (
    <div className="fixed inset-0 bg-black opacity-50 flex flex-col gap-5 justify-center items-center z-40">
      <div className="w-20 h-20 border-6 border-blue-500 border-t-transparent rounded-full animate-spin z-50"/>
      <span className="text-xl tracking-wide leading-5 text-white z-50">Carregando...</span>
    </div>
  );
}
