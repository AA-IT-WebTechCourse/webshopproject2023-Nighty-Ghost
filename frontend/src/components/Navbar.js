// @ts-ignore
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Row, Col,  InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import { AiOutlineClose } from 'react-icons/ai';
import React, { useEffect,useState } from 'react';
import FlashMessage from './FlashMessage' 
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BiCart } from 'react-icons/bi';
import { BsSearch } from "react-icons/bs";
import { BsPerson } from 'react-icons/bs';
import { AiOutlineHeart } from 'react-icons/ai';
import { BsBagCheck } from "react-icons/bs";
import Badge from 'react-bootstrap/Badge';

function NvBar() {

  const [isAuth, setisAuth] = useState(false);
  const TOKEN_KEY = "tokens"
  
  
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
  
  checkAuth();
  
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

  // SEARCH
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

  const cartDivItems = [];


    // RETRIEVE ITEMS 
    const [items, setItems] = useState([]);
    const [content, setcontent] = useState('');
    const [cartEmpty, setCartEmpty] = useState(false);
    const getCartItems = async () => {
      checkAuth();
      const tokens = getToken();
      try {
        
        if(isAuth){
              const response = await fetch("/api/update-cart/", {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokens.access}`,
                },
              
              });
              if(response.ok)
              {
                  const data = await response.json();
                  console.log("[RETURNED DATA QUERY CART: ", data.items, )
                  setItems(data.items)
                  console.log(items,data.items.length)
                  if(items.length > 0)
                  {
                    console.log("Items are > 0")

                      const cartDivItems = data.items.map((item, index) => (
                        <div key={index} style={{  
                          display: 'flex',
                          flexDirection: 'row',
                          marginBottom: "20px",
                          background: "yellow"
                        }}> Element {index}</div>
                      ));
                    setcontent(cartDivItems);
                    console.log("cartDiv content :\n",cartDivItems)
                    setCartEmpty(false)
                  }
              else{
                setCartEmpty(true)
              }
              //showFlashMessage(" Cart Items from cart",'succes')
          } else {
              showFlashMessage("Erro occured while trying to get the cart",'error')
          }
        }
        else{
          showFlashMessage("Only authenticated users can see the content of their cart",'error')
        }
    
      } catch (error) {
        showFlashMessage(String(error), 'error')
        console.error('Error occured', error);
      }
    };
  // SHOW AND HIDE CART
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  useEffect(() => {
    getCartItems();
  }, []);

  const showCart = () => {
    setIsPanelOpen(!isPanelOpen);
    getCartItems()
  };

  const hideCart = () => {
    setIsPanelOpen(false);
  };
  const panelStyle = {
    width: isPanelOpen ? '400px' : '0', 
    height: '100vh',
    marginTop: "80px",
    backgroundColor: '#fff', 
    overflowX: 'hidden',
    position: 'fixed',
    top: 0,
    right: 0, 
    transition: '0.5s', 
    zIndex: 1,
  };
  const closeBtnStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
  };
  

  // DELETE ITEM FROM CART
  const deleteItem = async (itemId) => {
    checkAuth();
    const tokens = getToken();
    try {
      
      if(isAuth){
        const response = await fetch("/api/update-cart/", {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.access}`,
          },
          body: JSON.stringify({
            itemId: itemId,
          }),
        });
        if(response.ok)
        {
            showFlashMessage("Item deleted from cart",'succes')
        } else {
            showFlashMessage("Erro occured",'error')
        }
      }
      else{
        showFlashMessage("Only authenticated users can order item(s)",'error')
      }
  
    } catch (error) {
      showFlashMessage(String(error), 'error')
      console.error('Error occured', error);
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand href="#">MarketFlow <BiCart /> </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" style={{maxWidth: "900px"}}>

        </Navbar.Collapse>
        <Nav className="me-auto" >
 
            
            <div style={{ display: 'flex', alignItems: 'center', marginRight:"15px", cursor:"pointer",  }}> 
  
            <div style={{ position: 'relative', display: 'inline-block' }}>
      <BsBagCheck size={18} id="cart" onClick={showCart} />
      <Badge bg="warning" style={{ position: 'absolute', bottom: -7, left: 7, fontSize:"8px", background:"yellow", color:"black" }}>
        9
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
                          justifyContent:'center', fontSize:"14px"}}>
              Cart

              
          </div>
          <div style = {{ display:'flex', 
                          flexDirection:'row',
                          alignItems:'center',
                          justifyContent:'center', fontSize:"14px"}}>
                
                <div id="cartItems">
                  {content}
                </div>
              </div>      


        </div>
      </div>
    </Navbar>
    
  );
}

export default NvBar;