"use client";

import styles from "@/app/page.module.css";
// import Card from "./components/Card";
import Cart from "./components/Cart";


import Navbar from 'react-bootstrap/Navbar';
import NvBar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Container, Form, Nav, Card, Row, Col, } from 'react-bootstrap';

import { useEffect, useState } from "react";
import UserMenuBar from "./components/UserMenu" 

export default function Home() {
  const [cart, setCart] = useState([]);
  const init = async () => {
    const res = await fetch("/api/cart", {
      headers: { "Content-type": "application/json" },
    });
    const data = await res.json();
    setCart(data);
  };
  useEffect(() => {
    init();
  }, []);

  //Populate DB with 6 users (of which 3 users (i.e. sellers) own 10 items)


  //add element to cart state
  const addCard = async (cardColor) => {
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ color: cardColor }),
      headers: { "Content-type": "application/json" },
    });
    await init();
  };

  //remove element from cart state based on index(key)
  const deleteCard = async (id) => {
    await fetch(`/api/cart/${id}`, {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
    });
    await init();
  };

  //get_all_items in db
   
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


  const divs = [];
  

  console.log(items)

  const cardStyle = {
    width: "200px",
    height: "300px",
    padding: "10px",
    margin: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0px 0px 5px #666",
    cursor: "pointer",
    fontSize: "9px"
    
  };
//<p>{item.description}</p>
  const itemsPerColumn = 4;
  const columns = [];
  for (let i = 0; i < items.length; i += itemsPerColumn) {
    const columnItems = items.slice(i, i + itemsPerColumn);
    const columnCards = columnItems.map((item, index) => (
      <div style={cardStyle}>
      
      <div style = {{display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
}}>
        <img src={item.img_url} alt={item.title} style={{ maxWidth: "150px", maxHeight: "150px" }} />
      </div>
      <Row>
        <p style={{"fontSize": "11px", margin:"5px"}}> <b>{item.title}</b></p>
      
        <p>Price: ${item.price}</p>
        <p>Date Added: {item.date_added}</p>
        <p>{item.is_sold ? "Sold" : "Available"}</p>
        <p>Seller ID: {item.seller_id}</p>
      </Row>
    </div>
    ));
    columns.push(<Row key={i} >

      {columnCards}
      
      </Row>);
  }


  return (
    <div>
      <UserMenuBar/>
      <NvBar/>
        
      <div style={{  
            display: 'flex',
            flexDirection: 'column',  // Ensure a vertical layout
            alignItems: 'center',
            justifyContent: 'center',
            margin: "10px",
            marginBottom:"100px",
            width: '80%',
          }}>
            <h1>Home</h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '10px auto', 
              }}
            >
              {columns}
            </div>
              <Cart  style={{
                "margin-top": '100px', 
              }} items={cart} deleteHandler={deleteCard} />
            </div>

            <a href="/">Back</a>
          </div>




  );
}
