import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Row, Col,  InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 

import { BsSearch } from "react-icons/bs";



import NavDropdown from 'react-bootstrap/NavDropdown';
import { BiCart } from 'react-icons/bi';

function NvBar() {

  const search = async => ({
      
  })
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
            <button className="btn btn-outline-dark d-flex align-items-center"  type="button" style={{ height:"20px"}}>
                <BsSearch size={10} />
              </button>
            <input type="text" className="form-control" placeholder="Search" aria-label="Search" style={{ fontSize:"10px", height:"20px"}}  />

          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NvBar;