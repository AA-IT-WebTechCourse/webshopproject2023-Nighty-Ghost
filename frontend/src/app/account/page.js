"use client";
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FlashMessage from './../../components/FlashMessage' 
import UserMenuBar from "../shop/components/UserMenu" 
import { Route, redirect } from 'react-router-dom';

import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';

const editAccount = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [flashMessage, setFlashMessage] = useState(null);
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
     if (res.ok) {
      setisAuth(true);
    }
    else {
      setisAuth(false);
    }
  }
  checkAuth()

  const showFlashMessage = (message, type) => {
        setFlashMessage({ message, type });
        };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };
  const updateUserInformation = async () => {
    const tokens = getToken();
  
    // Check if at least one of username, password, or email is not empty
    if (!username && !password && !email) {
      // Handle the case when none of the fields are filled
      return;
    }
  
    const requestBody = {
      username: username,
      password: password,
      email: email,
    };
  
    try {
      const res = await fetch("/api/me/", {
        method: "PUT", 
        headers: {
          "Authorization": `Bearer ${tokens.access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (res.ok) {
        
        console.log("User information updated successfully");
        showFlashMessage('Informations updated successfully', 'success')

      } else {
        // Handle the case when the update was not successful
        console.error("Failed to update user information:", res.statusText);
        const returned_error = "Failed to update user information:" + " " + String(res.statusText);
        showFlashMessage(returned_error, 'error')
      }
    } catch (error) {
      
      const returned_error = "Failed to update user information:" + String(error.message) ;
      showFlashMessage(returned_error, 'error')
      console.error("Error updating user information:", error.message);
    }
  };
  







  const todel = async () => {
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
    await updateUserInformation();
  };


  
  return (
    <div> 
      <UserMenuBar/>
      
    <Container style={{   
                        marginTop :"70px" 
                      }}>
      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={closeFlashMessage}
        />
      )}
                        
      <div style={{margin:"20px" ,display: "flex", flexDirection: "row" }}>

        <div style={{ background: "white",
                      flexDirection: "column",
                      width:"30%", 
                      maxHeight:"300px",
                      boxShadow: ' 2px 2px 13px 13px #D3D3D3', 
                      borderRadius: '0.5rem', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight:"20px"}}>
                          <div style={{ display:"flex", flex:"row", position: 'absolute', 
                                        top:'63px', left:'225px', background:"#929FBA", 
                                        color:"white", width:" 150px", height:"40px", alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'Arial, sans-serif', 
                                        fontSize: '18px', 
                                        fontWeight: 'bold',
                                        borderRadius: '0.5rem',
                                        marginBottom:"20px" 
                                        }}> 
                              
                               Edit Picture 
                          
                          </div>

                          <div style={{ display:"flex", flex:"row", justifyContent:"center", margin: "5px", marginTop: "50px" }}> 
                                <img
                                      data-test="avatar"
                                      src="https://mdbootstrap.com/img/Photos/Avatars/avatar-5.jpg"
                                      alt="User Photo"
                                      className="avatar z-depth-1 mb-3 mx-auto"
                                    />
                          </div>
                          <div style={{ display:"flex", flex:"row", justifyContent:"center", margin: "10px" }}>
                              <p style={{
                                          fontFamily: 'Arial, sans-serif', 
                                          fontSize: '14px',
                                          color:"A6A6A6" 
                                          
                                          }}> Edit your profile picture</p>
                            </div>

                          <div style={{ display:"flex", flex:"row", justifyContent:"center",marginTop: "5px", marginBottom: "30px"  }}> 
                            <Button variant="primary" style={{ border:"none", width:"130px", marginRight:"10px", fontSize:"10px"}}>
                                Upload a new picture
                            </Button>

                            <Button variant="danger" style={{ border:"none", width:"100px",marginLeft:"10px", fontSize:"10px"}}>
                                Delete picture
                            </Button>

                          </div>
        </div>
        <div style={{ background: "white",
                      flexDirection: "column",
                      width:"70%",                      
                      boxShadow: ' 2px 2px 13px 13px #D3D3D3', 
                      borderRadius: '0.5rem', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight:"20px"}}>

                <div style={{ display:"flex", flex:"row", position: 'absolute', 
                                                        top:'63px', left:'700px', background:"#929FBA", 
                                                        color:"white", width:" 250px", height:"40px", alignItems: 'center', justifyContent: 'center',
                                                        fontFamily: 'Arial, sans-serif', 
                                                        fontSize: '18px', 
                                                        fontWeight: 'bold',
                                                        borderRadius: '0.5rem',
                                                        }}> 
                                              
                                              Edit Account Informations
                                          
                                          </div>

      <Card className='bg-white my-5 ' style={{ border:"none"}}>
        <Card.Body className='p-5 w-100 d-flex flex-column' >
          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-4">
              <Form.Control type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}  />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Control type="email" placeholder="Email" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Control type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

          
            <Button variant="primary" className="mb-4 w-100"  onClick={updateUserInformation} type="submit" style = {{marginTop: "30px", width:"20px"}}>
              Apply
            </Button>
          
          </Form>
      </Card.Body>
      
      </Card>

        </div>
      </div>
    </Container>
    </div>
  );
};

export default editAccount;
