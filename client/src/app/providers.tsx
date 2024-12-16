"use client";

import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Order } from "@/types/orders";
import { ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export const SelectedOrderContext = createContext<
  ReturnType<typeof useState<Order | undefined>>
>([undefined, () => {}]);

export const SelectedOrderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = useState<Order | undefined>(undefined);
  const router = useRouter()


  useEffect(()=>{

    let token = Cookies.get("auth_token");

    if(!token) return router.push("/auth/signin")

  },[])

  return (
    <SelectedOrderContext.Provider value={store}>
      {children}
    </SelectedOrderContext.Provider>
  );
};

export const FilterContext = createContext<
  [string, Dispatch<SetStateAction<string>>]
>(["All", () => {}]);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useState<string>("All");
  return (
    <FilterContext.Provider value={store}>
      {children}
      <ToastContainer />
    </FilterContext.Provider>
  );
};
