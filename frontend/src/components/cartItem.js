import React from 'react';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from "react";
import FlashMessage from './FlashMessage'
import { RiDeleteBin2Line } from 'react-icons/ri';

//Function to display msg after validation cart if it fails
function displayNotification(id, msg) {
  const element = document.getElementById(id);
  if (element) {

    element.innerHTML = msg;
    element.style.display = "block";

    setTimeout(() => {
      element.style.display = "none";
      element.innerHTML = ""; // Clear the comment
    }, 10000);
  }
}

const ContainerCart = ({ setItemCartCount }) => {
  const TOKEN_KEY = "tokens"
  const [flashMessage, setFlashMessage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  
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

  const getCartItems = async () => {
    const tokens = getToken();
    try {
      
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
              console.log("ITEMS ARE : \n", data.items)
              setItemCartCount(data.items.length)

          //showFlashMessage(" Cart Items from cart",'succes')
      } else {
          displayNotification(`${itemReturned.id}-update_info`, msg)
          showFlashMessage("Erro occured while trying to get the cart",'error')
      }
      
  
    } catch (error) {
      showFlashMessage(String(error), 'error')
      console.error('Error occured', error);
    }
  };
  

  const payItems = async () => {
    getCartItems();
    const tokens = getToken();
    try {

            const response = await fetch("/api/validate-cart/", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.access}`,
              },
              body: JSON.stringify({
                items: cartItems,
              }),
            
            });
            const data = await response.json();
            const msg = data.msg;
            if(response.ok)
            {
                showFlashMessage(msg, 'success')
                setCartItems(null)
                setItemCartCount(0)
                
            //showFlashMessage(" Cart Items from cart",'succes')
        } else {
            
            showFlashMessage("Error occured while trying to validate the cart : ",'error')
            showFlashMessage(msg, 'error')
        }
      
  
    } catch (error) {
      showFlashMessage(String(error), 'error')
      console.error('Error occured', error);
    }
  };

  const deleteItem = async (itemId) => {
    const tokens = getToken()
    try {
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
            showFlashMessage("Item deleted from cart",'succes');
            console.log('Ondelete In cartItem')
            console.log("TRYING TO SET CART ITEM")
            setCartItems((prevCartItems) => prevCartItems.filter((item) => item.added_item.id !== itemId));
            console.log(setCartItems)
        } else {
            showFlashMessage("Erro occured",'error')
        }
    } 
    catch (error) {
      showFlashMessage(String(error), 'error')
      console.error('Error occured', error);
    }
  };

  useEffect(() => {
    getCartItems();
    const intervalId = setInterval(() => {
      getCartItems();
    },  30000); 

    return () => clearInterval(intervalId);
  }, []); 



 
    
  const cardStyle = {
    display : 'flex',
    flexDirection : 'row',
    justifyContent: 'center',  
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '10px',
    width : '80%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  };

  return (
    
    
    <div>
      <div style = {{ display:'flex', 
                          flexDirection:'row',
                          alignItems:'center',
                          justifyContent:'center', fontSize:"14px"}}> 

    <div id="cartItems" style={{display:'flex', 
                                flexDirection: 'column',
                                flexWrap: 'wrap',
                                alignItems:'center',
                                      justifyContent:'center',}}>
      {cartItems && cartItems.length > 0 && cartItems.map((item, index) => ( 
      <div 
      // @ts-ignore
          style={cardStyle} id={`item_card_${item.added_item.id}`}>

          {flashMessage && (
                  <FlashMessage
                    message={flashMessage.message}
                    type={flashMessage.type}
                    onClose={closeFlashMessage}
                  />
                )}

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width:"25%", marginRight:'20px' }}>
              {item.added_item.img_url ? (
                        <img
                          src={item.added_item.img_url}
                          alt={item.added_item.title}
                          style={{
                            background: '#F2F2F2',
                            width: '100px',
                            height: '100px',
                            marginTop: '0px',
                            padding: '0px',
                          }}
                        />
                      ) : (
                        <img
                          src={`${item.added_item.image}`} 
                          alt={item.added_item.title}
                          style={{
                            background: '#F2F2F2',
                            width: '100px',
                            height: '100px',
                            marginTop: '0px',
                            padding: '0px',
                          }}
                        />
                      )}

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', width: "90%", height:'90%', marginBottom:'10px' }}>
              <div style={{ display: 'flex', flexDirection: "row", alignItems: 'start', maxHeight:'20px' }}>
                <div style={{ width:'90%',fontSize: "13px", margin: "5px 0px 0px 2px", display: 'flex', flexDirection: "column" }}>
                  <b>{item.added_item.title}</b>
                </div>
                <div style={{ display: 'flex', cursor: 'pointer', flexDirection: "column", alignItems: 'flex-end', }}>
                  <RiDeleteBin2Line size={15} key={item.added_item.id} onClick={() => deleteItem(item.added_item.id)} />
                </div>
              </div>
              <div style={{
                width:'90%',
                fontSize: "10px", margin: "5px 0px 5px 2px",
                lineHeight: "1.5em",
                height: "4.2em",
                overflow: "hidden",
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                marginBottom: "10px"
              }}>
                {item.added_item.description}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: "row",
                width: "100%",
                fontSize: "11px",
                marginLeft: "2px"
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: "column",
                  width: "50%"
                }}>
                  <b>{item.added_item.price} €</b>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: "column",
                  alignItems: 'flex-end',
                  width: "48%",
                  fontSize: "10px"
                }}>
                  
                  {new Date(item.added_item.date_added).toISOString().split('T')[0]}
                  
                </div>
                    <div id={`${item.added_item.id}-update_info`} style = { {
                          display: 'none',
                          borderRadius: '5px',
                          margin: '10px',
                          width: '80%',
                          backgroundColor: '#F84F31',
                          color: 'white',
                          textAlign: 'center'
                        }}>
                    
                    </div>
              </div>
            </div>
      </div> ))}
      


      <div style={{  
                          display:'flex', 
                          flexDirection: 'column',
                          flexWrap: 'wrap',
                          alignItems:'center',
                          justifyContent:'center',
                          width:'80%',
                          }}>
                            {cartItems && cartItems.length > 0 ? (
                                <Button variant='success' style={{ width: '80%', marginBottom: "50px", marginTop: "20px" }} onClick={payItems}> Pay </Button>
                              ) : (
                                <h4 style={{marginTop : "80%"}}> Empty </h4>
                              )}

            </div>
            
      </div>
      
    </div>
    </div>
    
  );
};


export default ContainerCart;
