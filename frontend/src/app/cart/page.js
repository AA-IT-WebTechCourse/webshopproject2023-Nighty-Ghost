"use client";

import styles from "@/app/page.module.css";
//import Cart from "./components/Cart";
import { FaHeart } from 'react-icons/fa';
import { RiDeleteBin2Line } from "react-icons/ri";
import { AiOutlineHeart } from 'react-icons/ai';
import { AiFillHeart } from 'react-icons/ai';
import { BsCartPlus } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import { BiCartAdd } from "react-icons/bi";
import { BsFillCartCheckFill } from "react-icons/bs";

import Navbar from 'react-bootstrap/Navbar';
import NvBar from './../../components/Navbar'
import UserMenuBar from "./../../components//UserMenu";
import FlashMessage from './../../components/FlashMessage'

import 'bootstrap/dist/css/bootstrap.css';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';
import { useEffect, useState } from "react";


export default function Home() {

  const [cart, setCart] = useState([]);
  const TOKEN_KEY = "tokens"
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userinfo, setUserinfo] = useState("not logged in");
  const [activeTab, setActiveTab] = useState('login');
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

  const RemoveItemDiv = (ItemDivId) => {
    const divToRemove = document.getElementById(ItemDivId);

    if (divToRemove) {
      divToRemove.remove();
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
            const itemDivId = "item_card_"+itemId
            RemoveItemDiv(itemDivId)
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


const [items, setItems] = useState([]);

useEffect(() => {
        
      checkAuth();
      const tokens = getToken();

      const fetchData = async () => {

        try {
            const response = await fetch("/api/update-cart/", {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokens.access}`,
                },
              
              });

            const data = await response.json();
            console.log(typeof data.items); // Using typeof for a quick check
            console.log(Object.keys(data.items).length);
            setItems(data.items);
            console.log(data.items)
        } catch (error) {
            console.error('Error fetching items:', error);
        }
      };

        fetchData();
    }, [])

  const cardStyle = {
    display:"flex",
    flexDirection:"row",
    width: "400px",
    height: "105px",
    padding: "0px",
    margin: "6px",
    
    cursor: "pointer",
    fontSize: "9px"
    
  };

  
  const columns = [];

    const columnItems = items;
    const columnCards = columnItems.map((item, index) => (
      <div 
// @ts-ignore
      style={cardStyle}
      id={`item_card_${item.added_item.id}`}>
            
            <div style = {{display: 'flex',
                        flexDirection:'column',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        }}>
                <img src={item.added_item.img_url} alt={item.added_item.title} style={{ background: "#F2F2F2", maxWidth: "100px", 
                                                                maxHeight: "100px", marginTop:"0px", padding:"0px" }} />
            </div>
        
            <div style = {{display: 'flex',
                        flexDirection:'column',
                        flexWrap: 'wrap',

                        }}>
                <div style={{display: 'flex', flexDirection:"row", alignItems: 'start',}}>
                    <div style={{ width:"88%","fontSize": "11px", margin:"5px 0px 0px 2px", display: 'flex', flexDirection:"column"}}> 
                                <b>{item.added_item.title}</b>
                    </div>
                    <div style={{
                                    display: 'flex',
                                    cursor: 'pointer',                
                                    flexDirection:"column"
                                }}              
                    >
                        <RiDeleteBin2Line  size={15} key={item.added_item.id} onClick = {() => deleteItem(item.added_item.id)} />
                    </div>
            </div>
                <div style={{"fontSize": "8px", margin:"5px 0px 5px 2px",   
                
                            lineHeight: "1.5em",
                            height: "4.2em",       /* height is 2x line-height, so two lines will display */
                            overflow: "hidden",
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3, 
                            marginBottom:"10px"
                            }}>
                    
                            {item.added_item.description}
                </div>

                <div style = {{
                display:'flex',
                flexDirection:"row",
                width:"100%",
                fontSize: "11px",
                marginLeft:"2px"
                }}> 
                        <div style = {{
                                display:'flex',
                                flexDirection:"column",
                                width:"50%"
                                }}>
                                <b> {item.added_item.price} € </b>
                        </div>

                        <div style = {{
                                display:'flex',
                                flexDirection:"column",
                                alignItems: 'flex-end',
                                width:"48%",
                                fontSize: "10px"
                            }}>
                            {new Date(item.added_item.date_added).toISOString().split('T')[0]}
                        </div>
                </div>
            </div>
    </div>
    ));

    columns.push(<div style={{  
                              display: 'flex',
                              flexDirection: 'column',
                              marginBottom:"20px",  
                              
                            }} 
                            key={12} >

      {columnCards}
      
      </div>);
  

  

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
            width: '100%',
          }}>
            <h3> Bag </h3>


            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                
                
                margin: '10px auto', 
              }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection:'column',
                    flexWrap: 'wrap',
                    
                    alignItems: 'center',
                    margin: '10px auto', 
                }}>
                        {columns}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection:'column',
                    flexWrap: 'wrap',
                    
                    alignItems: 'center',
                    margin: '10px auto', 
                }}>
                    <div style={{
                    display: 'flex',
                    flexDirection:'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize:"20",
                    textAlign: "center",
                    }}>
                        <b> TOTAL</b>
                    </div>
                </div>
              

            </div>
            </div>

            <a href="/">Back</a>
          </div>





  );
}
