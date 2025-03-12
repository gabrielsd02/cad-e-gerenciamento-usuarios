"use client"

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter  } from "next/navigation";

import { setUser } from "@/redux/slices/userSlice";
import { api } from "@/api";
import Loading from "@/components/Loading";

const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("userToken"); 
  }
  return false;
};

export default function Home() {

  const router = useRouter();
  const dispatch = useDispatch();

  async function consultUserToken() {
    const url = '/user';

    try {
      const userToken = localStorage.getItem("userToken");
      
      // const data = await api(url, {
      //   method: 'GET',
      //   headers: {
      //     Authorization: userToken!
      //   }
      // });

      setUser(data);

    } catch(e) {
      router.push("/login"); 
    }   
  }

  useEffect(() => {
    if (isAuthenticated()) {
      await consultUserToken();
      router.push("/users");
    } else {
      router.push("/login"); 
    }
  }, []);

  return <Loading />;
}
