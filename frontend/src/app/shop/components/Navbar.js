import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Row, Col,  InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 

import { BsSearch } from "react-icons/bs";
import React, { useState } from 'react';
import FlashMessage from '../../../components/FlashMessage' 

import NavDropdown from 'react-bootstrap/NavDropdown';
import { BiCart } from 'react-icons/bi';

function NvBar() {
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const [SearchTerm, setSearchTerm] = useState('');
  const searchItemFunction = async () => {
    try {
      console.log("Submit cliked")
      console.log("SearchTerm : ",SearchTerm)
      
      const response = await fetch('/api/search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SearchTerm: SearchTerm,
        }),
      });
      const data = await response.json()
      console.log("Response for search is : ", response)
      console.log("Data sent back is : ", data)
      if(response.ok){
        showFlashMessage(data.length +'successfully!', 'success')
      }

      if (!response.ok) {
        showFlashMessage('Search failed', 'error')
        throw new Error('Search failed');
      }

    } catch (error) {
      console.error('Error during search:', error);
    }
  };




  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#">MarketFlow Shop <BiCart /> </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '50px' }}
            navbarScroll
          >
          
          </Nav>
          <div className="input-group d-flex flex-row" style={{width:"20%" ,fontSize:"10px"}} >
            <button className="btn btn-outline-dark d-flex align-items-center"  type="button" style={{ height:"20px"}} onClick={searchItemFunction}>
                <BsSearch size={10} />
              </button>
            <input type="text" className="form-control"  placeholder="Search" aria-label="Search" style={{ fontSize:"10px", height:"20px"}} value={SearchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NvBar;