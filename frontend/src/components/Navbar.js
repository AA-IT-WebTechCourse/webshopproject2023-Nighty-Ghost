// @ts-ignore

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import { AiOutlineClose } from 'react-icons/ai';
import React, { useEffect,useState } from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BiCart } from 'react-icons/bi';
import { BsSearch } from "react-icons/bs";
import { BsPerson } from 'react-icons/bs';
import { AiOutlineHeart } from 'react-icons/ai';
import { BsBagCheck } from "react-icons/bs";
import Badge from 'react-bootstrap/Badge';
import ItemCard from './ItemCard'
import ContainerCart from './cartItem'

const  NvBar = ({cartCount,setCartCount}) => {

  const [isAuth, setisAuth] = useState(false);
  const TOKEN_KEY = "tokens"
  
    
  //const [ItemCartCount, setItemCartCount] = useState(0);
  const [SearchTerm, setSearchTerm] = useState('');

  const [content, setcontent] = useState([]);
  const [cartEmpty, setCartEmpty] = useState(false);
  const [cartItems, setCartItems] = useState([]);
      // @ts-ignore

  
  const getToken = () => {

    if (typeof window !== 'undefined') {
      
      const value = localStorage.getItem(TOKEN_KEY);
      if(!value) return
      const tokens = JSON.parse(value)
      return tokens
    }
    else {
      return
    }    
  }

  const checkAuth = async () => {
    const tokens = getToken();
    
    if (tokens && tokens.access) {
      const res = await fetch("/api/me/", {
        headers: {
          "Authorization": `Bearer ${tokens.access}`
        }
      });
  
      if (res.ok) {
        setisAuth(true);
      } else {
        setisAuth(false);
      }
    } else {
      
      console.error("Tokens or access token is undefined");
      
    }
  };
  
  useEffect(() => {
    checkAuth();
    // Set up an interval to check every 5 minutes
    const intervalId = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds


    return () => clearInterval(intervalId);
  }, []); 

  useEffect(() => {
    getCartItems();
  }, [])

  

  // LOGOUT
  const logout = async () => {
    const tokens = getToken();
    
    if (tokens && tokens.access && tokens.refresh) {
      console.log(typeof(tokens.refresh))
      const res = await fetch("/api/logout/", {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${tokens.access}`,
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          refresh: String(tokens.refresh),
        }),
      });
  
      if (res.ok) {
        setisAuth(false);
        localStorage.setItem(TOKEN_KEY, JSON.stringify(""));
        window.location.replace('http://localhost:8080/login');
      } else {
        setisAuth(true);
      }
    } else {
      
      console.error("Tokens or access token is undefined");
      
    }

  }

  // Flashmessage
  // @ts-ignore
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };


  // SHOW AND HIDE CART
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getCartItems = async () => {
    const tokens = getToken();
    try {
          console.log("Try to fetch cartItems")
          const response = await fetch("/api/update-cart/", {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.access}`,
            },
          
          });
          const data = await response.json();
          const msg = data.msg
          const itemReturned = data.item
          if(response.ok)
          { 
              setCartItems(data.items)
              console.log(cartItems)
              console.log("ITEMS ARE : \n", data.items)
              setCartCount(data.items.length)

          //showFlashMessage(" Cart Items from cart",'succes')
      } 

      else {

          showFlashMessage("Error occured while trying to get the cart",'error')
      }
      
  
    } catch (error) {
      showFlashMessage(String(error), 'error')
      console.error('Error occured', error);
    }
  };

  const showCart = () => {
    setIsPanelOpen(!isPanelOpen);
    getCartItems();
    
  };

  const hideCart = () => {
    setIsPanelOpen(false);
  };

  const panelStyle = {
    
    width: isPanelOpen ? '600px' : '0px', 
    height: '100%',
    marginRight: "10px",
    boxShadow: isPanelOpen ? '2px 2px 13px 13px #D3D3D3' : '0px 0px 0px 0px #FFFFFF',
    borderRadius: isPanelOpen ? '0.5rem' : '0rem',
    marginBottom: "10px",
    backgroundColor: '#fff', 
    overflowX: 'hidden',
    position: 'fixed',
    top: 0,
    right: 0, 
    transition: '0.5s', 
    zIndex: 3,
  };

  const overlayStyle = {
    display: isPanelOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
    zIndex: 2, 
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
  };
  



  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid style={{display:'flex', flexDirection:'row'}}>
        <div style={{display:'flex', flexDirection:'column', width:'84%'}}> 
        <Navbar.Brand href="#">MarketFlow <BiCart /> </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" style={{width: "300px"}}>

        </Navbar.Collapse>
        </div>
        <Nav className="me-auto" style={{display:'flex', flexDirection:'row', alignContent:'flex-end', width:"100px",}}>
              
            
            <div style={{ display: 'flex', alignItems: 'center', marginRight:"15px", cursor:"pointer",  }}> 
  
                <div style={{ position: 'relative' }}>
                <BsBagCheck size={18} id="cart" onClick={showCart} />
                <Badge bg="warning" style={{ position: 'absolute', bottom: -7, left: 7, fontSize:"8px", background:"yellow", color:"black" }}>
                  {cartCount}
                </Badge>
              </div>
            </div> 
            
            <NavDropdown title={<BsPerson />} id="basic-nav-dropdown">
              <NavDropdown.Item href="http://localhost:8080/myitems">
                 Inventory 
              </NavDropdown.Item>

              <NavDropdown.Item href="http://localhost:8080/account">
               Account
              </NavDropdown.Item>

              <NavDropdown.Divider />
              
                  {
                    isAuth ? ( <NavDropdown.Item > <div onClick={logout}> <b> Logout </b> </div> </NavDropdown.Item>) : ( 
                    
                      <NavDropdown.Item  href="http://localhost:8080/login" style={{ textDecoration: 'none' }}>Login or Sign up 
                      </NavDropdown.Item >
                    
                  )
                  } 
              
            </NavDropdown>
        
        </Nav>
      </Container>
      <div 
// @ts-ignore
      style={overlayStyle} onClick={hideCart}></div>
      <div 
// @ts-ignore
      style={panelStyle}>
        <AiOutlineClose 
// @ts-ignore
        style={closeBtnStyle} size={24} onClick={hideCart} /> 
        <div style = {{ display:'flex', 
                        flexDirection:'column',
                        alignItems:'center',
                        justifyContent:'center'}}> 
         
          <div style = {{ display:'flex', 
                          flexDirection:'row',
                          alignItems:'center',
                          marginTop:"20px",
                          justifyContent:'center', fontSize:"14px"}}>
              <h1> <b>BAG</b> </h1>

              
          </div>
          <ContainerCart setItemCartCount={setCartCount} itemCart = {cartItems}/>

        </div>
      </div>
    </Navbar>
    
  );
}

export default NvBar;