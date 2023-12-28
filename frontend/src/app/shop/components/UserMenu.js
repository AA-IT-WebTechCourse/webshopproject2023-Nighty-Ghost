"use client";
import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Button, Card, Row, Col, } from 'react-bootstrap';
import { redirect } from "react-router-dom";

function UserMenuBar() {
  const [isAuth, setisAuth] = useState(false);
  const TOKEN_KEY = "tokens"
  const getToken = () => {
    const value  = localStorage.getItem(TOKEN_KEY)
    if(!value) return
    const tokens = JSON.parse(value)
    return tokens
  }
  const checkAuth = async () => {
    const tokens = getToken();
    const res = await fetch("/api/me/",
    {
      headers: {
        "Authorization": `Bearer ${tokens.access}`
      }
    });
    if (!res.ok) {
      setisAuth(false);
      
    } else if (res.ok) {
      setisAuth(true);
    
    }
  }
  checkAuth()

  
  
      

  const logout = () => {
     // Remove refresh token from localStorage
    localStorage.setItem(TOKEN_KEY, JSON.stringify(""));
    window.location.replace('http://localhost:8080/login');
  }

  const styles = {
                  sermenu: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',  // Adjusted to start from the right end
                    padding: '4px',
                    border: '1px solid #ccc',
                    fontSize: '8px',
                    backgroundColor: 'var(--podium-cds-color-white)'
                  },
                  menuItem: {
                    marginRight: '6px',
                    border:"none"
                    
                  },
                  link: {
                    textDecoration: 'none', 
                  },
                };   
  return (
    <>
 <div style={styles.sermenu} data-pre="UserMenu">

      <div style={styles.menuItem} data-var="Shop">
        <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
          <b> My Items </b>
        </span>
        <span className="mr1-sm body-4" data-var="shopSeparator">
          |
        </span>
      </div>

      <div style={styles.menuItem} data-var="Shop">
        <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
          <b> Account </b>
        </span>
        <span className="mr1-sm body-4" data-var="shopSeparator">
          |
        </span>
      </div>

      <div style={styles.menuItem} data-var="SignUpButton">
      <a href="http://localhost:8080/signup" style={{ textDecoration: 'none' }}>
          <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
            <b> Sign Up </b> 
          </span> 
        </a>
        <span className="mr1-sm body-4" data-var="SignUpButtonSeparator">
          |
        </span>
      </div>

      <div style={styles.menuItem} data-var="LoginButton">
        {
          isAuth ? ( <div onClick={logout}> <b> Logout </b> </div>) : (<a href="http://localhost:8080/login" style={{ textDecoration: 'none' }}> 
          <span id="" style={{margin: '4px', color: 'black'}} className="prl1-sm">
            <b> Login </b> 
          </span>
        </a>)
        }
        
      </div>
    </div>

    </>
  );
}

export default UserMenuBar;