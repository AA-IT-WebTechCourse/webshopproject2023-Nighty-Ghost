import React, { useState } from 'react';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaGoogle, FaGithub } from 'react-icons/fa';
import FlashMessage from '../../../components/FlashMessage' 

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
      }

      if (!response.ok) {
        console.log("Login failed")
        showFlashMessage('Login failed. Username or Password incorrect', 'error')
        throw new Error('Login failed');
      }

      // Handle successful login, e.g., store the token in local storage or state
    } catch (error) {
      console.error('Error during login:', error);
      // Handle login error, e.g., display an error message to the user
    }
  };

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
      <Card className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px', boxShadow: ' 2px 2px 13px 13px #D3D3D3',}}>
        <Card.Body className='p-5 w-100 d-flex flex-column'>
          <Form>
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


            <Button variant="dark" className="mb-4 w-100"  onClick={handleLogin}>
              Sign in
            </Button>
            <p className="text-center">
              Not a member? Please <a href='http://localhost:8080/register' style={{ textDecoration: 'none' }}> register</a>
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

  );
}

export default Login_Reg;
