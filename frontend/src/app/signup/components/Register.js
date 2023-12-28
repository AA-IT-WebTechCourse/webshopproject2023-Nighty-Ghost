import React, { useState } from 'react';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaGoogle, FaGithub } from 'react-icons/fa';
import FlashMessage from '../../../components/FlashMessage' 


function Reg() {

  const TOKEN_KEY = "tokens"
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [info, setInfo] = useState("");

  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

  const handleRegister = async () => {
    const res = await fetch("/api/register/", {
      headers: {
        "Content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({username, email, password}),
    });
    
    const data = await res.json()
    
    if(res.ok){
      localStorage.setItem(TOKEN_KEY,JSON.stringify(data))
      showFlashMessage('Register successful!', 'success')
      console.log(data)
      setInfo(JSON.stringify(data))
    }
    if (!res.ok) {
      console.log("Register failed")
      showFlashMessage('Register failed. Username must not contain special characters and be unique', 'error')
      throw new Error('Login failed');
    }
    
  }

  const getToken = () => {
    const value  = localStorage.getItem(TOKEN_KEY)
    if(!value) return
    const tokens = JSON.parse(value)
    return tokens
  }

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

        <Form>
          <div className="mb-4">
            <FaFacebookF className="m-1" />
            <FaTwitter className="m-1" />
            <FaGoogle className="m-1" />
            <FaGithub className="m-1" />
          </div>

          <Form.Group className="mb-4">
            <Form.Control type="text"  placeholder="Username" value={username}  onChange={(e) => setUsername(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control type="email" placeholder="Email" value={email}  onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control type="password" placeholder="Password" value={password}  onChange={(e) => setPassword(e.target.value)}/>
          </Form.Group>

          <Button variant="dark" className="mb-4 w-100" onClick={handleRegister}>
            Sign up
          </Button>
        </Form>
        
      </Card.Body>
      </Card>

    </Container>

  );
}

export default Reg;
