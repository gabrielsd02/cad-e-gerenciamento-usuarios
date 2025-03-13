"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Loading from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  
  async function redirect() {
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
  
  useEffect(() => {
    redirect();
  }, []);

  return <Loading />;
}
