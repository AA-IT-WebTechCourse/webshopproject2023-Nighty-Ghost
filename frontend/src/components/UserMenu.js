"use client";
import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Button, Card, Row, Col, } from 'react-bootstrap';
import { redirect } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaGoogle, FaGithub } from 'react-icons/fa';

function UserMenuBar() {

 
  const styles = {
                  sermenu: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',  // Adjusted to start from the right end
                    padding: '0px',
                    border: '1px solid #ccc',
                    fontSize: '8px',
                    marginBottom:"2px",
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
    
 <div style={styles.sermenu} data-pre="UserMenu">
      <div>
              <FaFacebookF size={12} className="m-1" style = {{marginRight:"60px"}} />
              <FaTwitter size={12} className="m-1" style = {{marginRight:"60px"}}/>
              <FaGoogle size={12} className="m-1" style = {{marginRight:"60px"}}/>
              <FaGithub size={12} className="m-1" style = {{marginRight:"60px"}}/>
        </div>

</div>

    
  );
}

export default UserMenuBar;