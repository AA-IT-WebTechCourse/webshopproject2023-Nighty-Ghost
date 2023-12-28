"use client";


import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NvBar from "../shop/components/Navbar";
import 'bootstrap/dist/css/bootstrap.css';
import Login_Reg from './components/Login';

import { useEffect, useState } from "react";
import UserMenuBar from "../shop/components/UserMenu" 

export default function Log_Register() {

  return (
    <div>
        <UserMenuBar/>
        
        <Login_Reg/>
 
    </div>
  );
}
