"use client";
import ItemContainer from './../../components/ItemsContainer.js'; 

import { BsSearch } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.css';

import { useEffect, useState } from "react";
import NvBar from './../../components/Navbar'
import UserMenuBar from "./../../components//UserMenu";
import FlashMessage from './../../components/FlashMessage'
import ItemCard from './../../components/ItemCard'

export default function Home() {

  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const [ItemCartCount, setItemCartCount] = useState(0);

  const TOKEN_KEY = "tokens"
  const [isAuth, setisAuth] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const closeFlashMessage = () => {
    setFlashMessage(null);
    console.log("SETMESSAGE NULL")
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


 // SEARCH
 const [SearchTerm, setSearchTerm] = useState('');
 const searchItemBase = async () => {
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
     
     if(response.ok){
      const data_items = data.items
      console.log("Data sent back is : ", data_items)
      setItems(data.items);
       showFlashMessage(data_items.length +' result(s) found !', 'success')
     }

     if (!response.ok) {
       showFlashMessage('Search failed', 'error')
       throw new Error('Search failed');
     }

   } catch (error) {
     console.error('Error during search:', error);
   }
 };



  // DEALING WITH CART ITEM ADDITION
  const addItemToCart = async (item) => {
    checkAuth();
    const tokens = getToken();
    console.log("checkAuth: ", tokens)
    try {
      console.log("Inside addItemToCart asyn, isAuth : ", isAuth)
      
        const response = await fetch("/api/update-cart/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.access}`,
          },
          body: JSON.stringify({
            itemId: item.id,
            price: item.price
          }),
          
        });
        const data = await response.json()
        console.log(data.msg);
        const msg = data.msg;
        if(response.ok)
        {
            showFlashMessage(msg,'succes')
            const NewItemCartCount = ItemCartCount + 1;
            setItemCartCount(NewItemCartCount)
        }      
        else if(response.status === 403)
        {
          
          showFlashMessage("Only authenticated users can order item(s)",'error')
        } 
        else {

            showFlashMessage(msg,'error')
        }

    } catch (error) {
      
      console.error('Error occured', error);
      showFlashMessage("Only authenticated users can order item(s)",'error')
    }
  };


   


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/get_items/');
                const data = await response.json();
                console.log(typeof data.items); 
                console.log(Object.keys(data.items).length);
                setItems(data.items);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchData();
    }, [])


  const onSetCount = (newCount) => {
    setItemCartCount(newCount);
  };
  
  return (
    <div>
      <UserMenuBar/>
      <NvBar cartCount = {ItemCartCount} setCartCount = {setItemCartCount}/>
      
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
                                                              width:"1300px",
                                                              marginTop:"30px",
                                                            
                                                              }} >
                                                      
                    <button className="btn btn-outline-dark d-flex align-items-center"  type="button" style={{ height:"30px", }} onClick={searchItemBase}>
                        <BsSearch size={15} />
                      </button>
                    <input type="text" className="form-control"  placeholder="Search" aria-label="Search" 
                            style={{ fontSize:"10px", height:"30px", width:"90%",}} 
                            value={SearchTerm} onChange={(e) => setSearchTerm(e.target.value)}   onKeyUp={(e) => {
                              if (e.key === 'Enter') {
                                  searchItemBase();
                              }
                          }}/>
            </div>
          </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '20px', 
              }}> 
                <ItemContainer items={items} itemFunction={addItemToCart} />
             </div>
            </div>

            <a href="/">Back</a>
          </div>




  );
}
