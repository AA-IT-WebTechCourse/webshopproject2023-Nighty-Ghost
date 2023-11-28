"use client";

import styles from "@/app/page.module.css";
import Card from "./components/Card";
import Cart from "./components/Cart";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NvBar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.css';

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
                setItems(data.items);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchData();
    }, [])

  const colorList = ["red", "blue", "yellow", "black"];
  const ColorListJSX = items.map((item) => (
    <Card
      item={item}
      //key={key}
      // a key property is required internally by react to manage the components in the list
      clickHandler={addCard}
    />
  ));
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
            <h1>Lecture 6</h1>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  padding: "10px",
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: "10px",
                  minWidth: "80vw",
                }}
              >
                {ColorListJSX}
              </div>

              <Cart items={cart} deleteHandler={deleteCard} />
            </div>

            <a href="/">Back</a>
          </div>




    </div>
  );
}
