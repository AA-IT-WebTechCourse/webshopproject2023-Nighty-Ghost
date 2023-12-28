"use client";


import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NvBar from "../l6/components/Navbar";
import 'bootstrap/dist/css/bootstrap.css';
import Reg from './components/Register';

import { useEffect, useState } from "react";
import UserMenuBar from "../l6/components/UserMenu" 

export default function Log_Register() {

  return (
    <div>
        <UserMenuBar/>
        <Reg/>
 
    </div>
  );
}
