"use client";


import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.css';
import EditAccount from './components/account';

import { useEffect, useState } from "react";

export default function AccountFunction() {

  return (
    <div>
        
        <EditAccount/>
 
    </div>
  );
}
