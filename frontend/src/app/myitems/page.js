"use client";


import { BsSearch } from "react-icons/bs";
import { BiCartAdd } from "react-icons/bi";



import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from "react";
import NvBar from '../../components/Navbar'
import UserMenuBar from "../../components/UserMenu";
import FlashMessage from '../../components/FlashMessage'

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

  const [isHovered0, setIsHovered0] = useState(false);
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const myItemsFilterstyles = {
    myItemsFilterMenuCtn: {
      width: '60%',
      margin: 'auto',
      display: 'flex',
      alignContent: 'stretch',
    },
    myItemsFilterMenu: {
      display: 'inline-block',
      padding: '10px 5px',
      flex: 1,
      color: 'whitesmoke',
      textDecoration: 'none',
      textAlign: 'center',
      fontWeight: 600,
      lineHeight: '30px',
      verticalAlign: 'middle',
      transition: 'transform 0.3s ease-in-out',
    },
    myItemsFilterMenuLink: {
      color: 'whitesmoke',
    },
    myItemsFilterMenu0: {
      backgroundColor: 'darkblue',
      color: 'white',
      borderRadius: '5px 0px 0px 5px',
    },
    myItemsFilterMenu1: {
      backgroundColor: '#C0E410',
    },
    myItemsFilterMenu2: {
      backgroundColor: '#4F9E30',
      borderRadius: '0px 5px 5px 0px',
    },
    myItemsFilterMenuHover: {
      transform: 'scale(1.1)',
      zIndex: 9999,
    },
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

const addItem = async (itemId) => {
  checkAuth();
  const tokens = getToken();
  console.log("checkAuth: ", tokens)
  try {
    console.log("Inside addItem asyn, isAuth : ", isAuth)
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
        checkAuth();
        const tokens = getToken();
  
        const fetchData = async () => {
  
          try {
              const response = await fetch("/api/my-items/", {
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
      <div style={cardStyle}>
      
      <div style = {{display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                  }}>
        <img src={item.img_url} alt={item.title} style={{ background: "#F2F2F2", maxWidth: "200px", 
                                                          maxHeight: "200px", marginTop:"0px", padding:"0px" }} />
      </div>
      <div>
        <div style={{display: 'flex', flexDirection:"row", alignItems: 'center',}}>
              <div style={{ width:"88%","fontSize": "11px", margin:"5px 0px 5px 2px", display: 'flex', flexDirection:"column"}}> <b>{item.title}</b></div>
              <div style={{
                            display: 'flex',
                            cursor: 'pointer',                
                            flexDirection:"column"
                          }}              
              >
                <BiCartAdd size={18} key={item.id} onClick = {() => addItem(item.id)} />
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
              
                      {item.description}
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
                          <b> {item.price} € </b>
                  </div>

                  <div style = {{
                        display:'flex',
                        flexDirection:"column",
                        alignItems: 'flex-end',
                        width:"48%",
                        fontSize: "10px"
                      }}>
                      {new Date(item.date_added).toISOString().split('T')[0]}
                  </div>
          </div>
      </div>
    </div>
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

<div style={myItemsFilterstyles.myItemsFilterMenuCtn}>
      <div
        style={{
          ...myItemsFilterstyles.myItemsFilterMenu,
          ...myItemsFilterstyles.myItemsFilterMenu0,
          ...(isHovered0 && myItemsFilterstyles.myItemsFilterMenuHover),
        }}
        onMouseEnter={() => setIsHovered0(true)}
        onMouseLeave={() => setIsHovered0(false)}
      >
        Selling items
      </div>
      <div
        style={{
          ...myItemsFilterstyles.myItemsFilterMenu,
          ...myItemsFilterstyles.myItemsFilterMenu1,
          ...(isHovered1 && myItemsFilterstyles.myItemsFilterMenuHover),
        }}
        onMouseEnter={() => setIsHovered1(true)}
        onMouseLeave={() => setIsHovered1(false)}
      >
        Sold items
      </div>
      <div
        style={{
          ...myItemsFilterstyles.myItemsFilterMenu,
          ...myItemsFilterstyles.myItemsFilterMenu2,
          ...(isHovered2 && myItemsFilterstyles.myItemsFilterMenuHover),
        }}
        onMouseEnter={() => setIsHovered2(true)}
        onMouseLeave={() => setIsHovered2(false)}
      >
        Ordered items
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
