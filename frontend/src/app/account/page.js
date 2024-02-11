"use client";

import React, { useEffect, useState } from "react";
import ErrorPage from 'next/error';
import { checkAuth } from './../../utils';
import NvBar from './../../components/Navbar';
import UserMenuBar from "./../../components/UserMenu";
import EditAccount from './components/account';

export default function AccountFunction() {
  const [ItemCartCount, setItemCartCount] = useState(0);
  const [isAuth, setisAuth] = useState(false);
  const [unAuthenticatedComponent, setUnAuthenticatedComponent] = useState(null);
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
           //console.log("User is authenticated");
          setisAuth(true);
        } else {
          setisAuth(false);
          setUnAuthenticatedComponent(<ErrorPage statusCode={403} title='Authentication needed to access this page' />);
           //console.log("User is not authenticated");
        }
      } catch (error) {
         console.error("Error in checkAuthentication:", error);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <div>
      {isAuth ? (
        <>
          <UserMenuBar />
          <NvBar cartCount={ItemCartCount} setCartCount={setItemCartCount} />
          <EditAccount />
        </>
      ) : (
        <>
          <div> {unAuthenticatedComponent} </div>
        </>

      )}
    </div>
  );
}
