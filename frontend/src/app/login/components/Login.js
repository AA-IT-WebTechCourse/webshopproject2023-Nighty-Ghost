import React, { useState } from 'react';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaGoogle, FaGithub } from 'react-icons/fa';
import FlashMessage from '../../../components/FlashMessage' 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { redirect } from "react-router-dom";
import Home from '../../shop/page';

function PageRedirection() {
  return (
    <Routes>
      <Route path="/shop" element={<Home />} />
    </Routes>
  );
}

function Login_Reg() {

  const TOKEN_KEY = "tokens"
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userinfo, setUserinfo] = useState("not logged in");
  const [activeTab, setActiveTab] = useState('login');

  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

  const handleLogin = async () => {
    try {
      console.log("Submit cliked")
      console.log("Username : ",username)
      console.log("Pass : ",password)
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const data = await response.json()
      console.log("Response for loggin is : ", response)
      console.log("Data sent back is : ", data)
      if(response.ok){
        
        localStorage.setItem(TOKEN_KEY,JSON.stringify(data))
        showFlashMessage('Logged successfully!', 'success')
        // const navigate = useNavigate();
        // setTimeout(() => {
        //   navigate('/shop');
        // }, 1000);
        const timeout = setTimeout(() => {
          window.location.replace('http://localhost:8080/shop');
        }, 1000);
        
      }

      if (!response.ok) {
        console.log("Login failed")
        showFlashMessage('Login failed. Username or Password incorrect', 'error')
        throw new Error('Login failed');
      }

    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleLogin();
  };


  const getToken = () => {
    const value  = localStorage.getItem(TOKEN_KEY)
    if(!value) return
    const tokens = JSON.parse(value)
    return tokens
  }

 

  return (
    <div>
      <div style={{margin:"50px"}} >{flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={closeFlashMessage}
        />
      )}
      </div>
    <Container className="p-3 my-5 d-flex flex-column w-50">

      <Card className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px', boxShadow: ' 2px 2px 13px 13px #D3D3D3',}}>
        <Card.Body className='p-5 w-100 d-flex flex-column'>
          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <FaFacebookF className="m-1" />
              <FaTwitter className="m-1" />
              <FaGoogle className="m-1" />
              <FaGithub className="m-1" />
            </div>

            <Form.Group className="mb-4">
              <Form.Control type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

          
            <Button variant="dark" className="mb-4 w-100"  onClick={handleLogin} type="submit">
              Sign in
            </Button>
          
            <p className="text-center">
              Not a member? Please <a href='http://localhost:8080/signup' style={{ textDecoration: 'none' }}> register</a>
            </p>
          </Form>
      </Card.Body>
      </Card>
      <div>
        <h2>User info</h2>
        <p>{userinfo}</p>
        <button
          type="button"
          onClick={async () => {
            const tokens = getToken();
            const res = await fetch("/api/me/",
            {
              headers: {
                "Authorization": `Bearer ${tokens.access}`
              }
            });
            const text = await res.text();
            setUserinfo(text);
          }}
        >
          Get user info
        </button>
      </div>

    </Container>
    </div>

  );
}

export default Login_Reg;
