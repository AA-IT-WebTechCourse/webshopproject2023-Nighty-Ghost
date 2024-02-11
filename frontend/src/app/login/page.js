"use client";


import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.css';
import Login_Reg from './components/Login';
import NvBar from './../../components/Navbar'
import UserMenuBar from "./../../components//UserMenu";
import FlashMessage from './../../components/FlashMessage'

import { useEffect, useState } from "react";


export default function Log_Register() {

  return (
    <div>
      <Login_Reg />
    </div>
  );
}
