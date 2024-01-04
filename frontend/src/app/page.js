"use client";
import styles from "./page.module.css";
import Link from "next/link";
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import FlashMessage from '../components/FlashMessage' 

export default function Home() {


  //ASK HERE LANDING6PAGE HTML
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

  const handleCreateUsersAndItems = async () => {
    try {
      const response = await fetch('api/populate_db/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Populate DB clicked")
      if (response.ok) {
        const data = await response.json();
        showFlashMessage("Users and items created","success")
        console.log(data.message);
      } else {
        console.error('Failed to create users and items');
        showFlashMessage("Failed to created users and items","error")
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (

    <Container className="p-3 my-5 d-flex flex-column w-50">
  
    {flashMessage && (
          <FlashMessage
            message={flashMessage.message}
            type={flashMessage.type}
            onClose={closeFlashMessage}
          />
        )}
      <Card className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px', boxShadow: ' 2px 2px 13px 13px #D3D3D3' }}>
        <Card.Body className='p-5 w-100 d-flex flex-column'>

            <div>

              <div className="mb-4">
              <Link href="./shop">
                <Button variant="dark" className="mb-4"style={{ border:"none", width:"200px"}}>
                  Home
                </Button>
                </Link>
              </div>

              <div className="mb-4">
                <Link href="./login">
                <Button variant="dark" className="mb-4"style={{ border:"none", width:"200px"}}> 
                  Login 
                </Button>
                </Link>
              </div>

              <div className="mb-4">

                <Link href="./signup">
                  <Button variant="dark" className="mb-4"style={{ border:"none", width:"200px"}}>
                    Sign up
                  </Button>
                </Link>
              </div>

              <div>
                <Button variant="dark" className="mb-4" onClick={handleCreateUsersAndItems} style={{ border:"none", width:"200px"}}>
                  Populate Database
                </Button>
              </div>
            </div>
        
      </Card.Body>
      </Card>
    </Container>

  );
}
