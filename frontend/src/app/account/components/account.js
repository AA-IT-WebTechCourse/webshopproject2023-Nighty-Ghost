import React, { useState } from 'react';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaGoogle, FaGithub } from 'react-icons/fa';
import FlashMessage from '../../../components/FlashMessage' 


function EditAccount() {

  const TOKEN_KEY = "tokens"
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');

  const [info, setInfo] = useState("");

  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

  const SubmitEditAccount = async () => {
    const tokens = getToken();
    const res = await fetch("/api/edit-account/", {
      headers: {
        "Content-type": "application/json",
      },
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
      },
      body: JSON.stringify({
        password: oldPassword,
        new_password: password

      }),
    });
    
    const data = await res.json()
    console.log(data)
    const msg = data.msg
    if(res.ok){
      
      showFlashMessage(msg, 'success')
      console.log(data)
    }
    if (!res.ok) {
      console.log("Failed")
      showFlashMessage(msg, 'error');
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
        <div className="d-flex justify-content-center align-items-center mb-4">
          <FaFacebookF className="m-1" />
          <FaTwitter className="m-1" />
          <FaGoogle className="m-1" />
          <FaGithub className="m-1" />
        </div>


          <Form.Group className="mb-4" style={{ marginBottom:"20px"}}>
            <Form.Control type="password"  placeholder="Current Password" value={oldPassword}  onChange={(e) => setOldPassword(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Control type="password" placeholder="New Password" value={password}  onChange={(e) => setPassword(e.target.value)}/>
          </Form.Group>

          <Button variant="dark" className="mb-4 w-100" onClick={SubmitEditAccount}>
            Update
          </Button>
        </Form>
        
      </Card.Body>
      </Card>

    </Container>

  );
}

export default EditAccount;
