"use client";

import { FaHeart } from 'react-icons/fa';
import { AiOutlineHeart } from 'react-icons/ai';
import { AiFillHeart } from 'react-icons/ai';
import { BsCartPlus } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import { BiCartAdd } from "react-icons/bi";
import { BsFillCartCheckFill } from "react-icons/bs";

import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import { useEffect, useState } from "react";
import NvBar from './../../components/Navbar'
import UserMenuBar from "./../../components//UserMenu";
import FlashMessage from './../../components/FlashMessage'
import ItemCard from './../../components/ItemCard'

export default function Home() {

  const [cart, setCart] = useState([]);
  const TOKEN_KEY = "tokens"
  const [isAuth, setisAuth] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
  };

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
    console.log("checkAuth: ", tokens)
    
    if (tokens) {
      const res = await fetch("/api/me/", {
        headers: {
          "Authorization": `Bearer ${tokens.access}`
        }
      });
  
      if (res.ok) {
        
        setisAuth(true);
        console.log("User is authenticated", isAuth)
      } else {
        setisAuth(false);
        console.log("User is not authenticated")
      }
      return tokens
    } else {
      console.error("Tokens or access token is undefined"); 
      return
    }
  };
  
  useEffect(() => {
    //init();
  }, []);

  const HeartIcon = ({ itemID }) => {
    const [isLiked, setIsLiked] = useState(false);
  
    const handleHeartClick = () => {
      setIsLiked(!isLiked);
      
    };
  
    return (
      <div
        style={{
          display: 'flex',
          cursor: 'pointer',
          flexDirection: 'column',
        }}
        onClick={handleHeartClick}
      >
        {isLiked ? (
          <BsFillCartCheckFill  size={18} key={itemID}  onClick={deleteItem} />
        ) : (
          
          <AiOutlineHeart size={18} key={itemID}  onClick= {() => addItemToCart(itemID)} />
        )}
      </div>
    );
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


  // DELETE ITEM FROM CART
  const deleteItem = async (itemId) => {
    checkAuth();
    const tokens = getToken()
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

  // DEALING WITH CART ITEM ADDITION
  const [cartItems, setCartItems] = useState([]);



  const addItemToCart = async (itemId) => {
    checkAuth();
    const tokens = getToken();
    console.log("checkAuth: ", tokens)
    try {
      console.log("Inside addItemToCart asyn, isAuth : ", isAuth)
      if(isAuth){
        const response = await fetch("/api/update-cart/", {
          method: 'POST',
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
            showFlashMessage("Item(s) ordered",'succes')
        } else {
          const data = await response.json()
          console.log(data.msg)
            showFlashMessage("Item is no longer available",'error')
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


   
  const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('api/get_items/');
                const data = await response.json();
                console.log(typeof data.items); // Using typeof for a quick check
                console.log(Object.keys(data.items).length);
                setItems(data.items);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchData();
    }, [])

  const cardStyle = {
    
    width: "202px",
    height: "295px",
    padding: "0px",
    margin: "6px",
    
    //border: "1px solid #ccc",
    //borderRadius: "5px",
    //boxShadow: "0px 0px 5px #666",
    
    cursor: "pointer",
    fontSize: "9px"
    
  };

  
  const itemsPerColumn = 6;
  const columns = [];
  for (let i = 0; i < items.length; i += itemsPerColumn) {
    const columnItems = items.slice(i, i + itemsPerColumn);
    const columnCards = columnItems.map((item, index) => (
      <ItemCard key={item.id} item={item} itemFunction={addItemToCart} />
    ));

    columns.push(<div style={{  
                              display: 'flex',
                              flexDirection: 'row',
                              marginBottom:"20px",  
                              
                            }} 
                            key={i} >

      {columnCards}
      
      </div>);
  }


  return (
    <div>
      <UserMenuBar/>
      <NvBar/>
      
      {flashMessage && (
        <FlashMessage
          message={flashMessage.message}
          type={flashMessage.type}
          onClose={closeFlashMessage}
        />
      )}
      <div style={{  
            display: 'flex',
            flexDirection: 'column',  
            alignItems: 'center',
            justifyContent: 'center',
            margin: "5px",
            marginBottom:"100px",
            width: '98%',
          }}>
            
            <div style={{ display: 'flex',
                          flexDirection: 'row',
                          
                          marginRight:"40%",
                           fontSize:"10px", }} >
              <div className="input-group " style={{display: 'flex',
                                                            flexDirection: 'row',
                                                            marginLeft:"50%",
                                                              marginRight:"50px",
                                                              fontSize:"10px",
                                                              width:"1000px",
                                                            
                                                              }} >
                                                      
                    <button className="btn btn-outline-dark d-flex align-items-center"  type="button" style={{ height:"20px", }} onClick={searchItemFunction}>
                        <BsSearch size={15} />
                      </button>
                    <input type="text" className="form-control"  placeholder="Search" aria-label="Search" style={{ fontSize:"10px", height:"20px", maxWidth:"700px"}} value={SearchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '15px', 
              }}
            >
              {columns}

            </div>
            </div>

            <a href="/">Back</a>
          </div>




  );
}
