"use client";

import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import { store } from "@/redux/store";
import Loading from "@/components/Loading";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
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
