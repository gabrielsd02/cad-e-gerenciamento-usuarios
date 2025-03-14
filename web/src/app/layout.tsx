"use client";

import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import { store } from "@/redux/store";
import Loading from "@/components/Loading";
import "./globals.css";
import { SyncUserFromLocalStorage } from "@/utils/syncUserFromLocalStorage";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
function SyncUser() {
  SyncUserFromLocalStorage(); 
  return null;
}

return (
  <html lang="pt-br">
    <body>
      <Provider store={store}>
          <SyncUser />
          <Loading />
          <main>
            {children}
          </main>
          <ToastContainer />
      </Provider>
    </body>
  </html>
);
}
