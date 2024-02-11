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
      //element.style.display = "none";
      element.innerHTML = ""; // Clear the comment
    }, 10000);
  }
  else {


  }
}

const ContainerCart = ({ setItemCartCount, itemCart }) => {
  const TOKEN_KEY = "tokens"
  const [flashMessage, setFlashMessage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalPriceCart, setTotalPriceCart] = useState(0);

  const showFlashMessage = (message, type) => {
    setFlashMessage({ message, type });
  };

  const calculateTotalPrice = (items) => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += parseFloat(items[i].price);
    }
    return parseFloat(total.toFixed(2));
  };

  useEffect(() => {
    setCartItems(itemCart);
     //console.log('Items in cart are :\n', itemCart)
    let total = calculateTotalPrice(itemCart)
     //console.log("Total", total)
    setTotalPriceCart(total);
  }, [itemCart]);




  const closeFlashMessage = () => {
    setFlashMessage(null);
  };
  const getToken = () => {

    if (typeof window !== 'undefined') {

      const value = localStorage.getItem(TOKEN_KEY);
      if (!value) return
      const tokens = JSON.parse(value)
      return tokens
    }
    else {
      return
    }
  }

  const payItems = async () => {

    const tokens = getToken();
    try {
      const idAndPriceList = cartItems.map(item => ({ id: item.id, price: item.price }));
       //console.log(idAndPriceList);
      const response = await fetch("/api/validate-cart/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({
          idAndPriceList: idAndPriceList
        }),

      });
      const data = await response.json();
      const msg = data.msg;
      const error_type = data.error_type;
      const itemReturned = data.Item
      const dataItemsReturned = data.list_failed_purchases
       //console.log(response.status)
      if (response.ok) {
        showFlashMessage(msg, 'success')
        setCartItems(null)
        setItemCartCount(0)

        //showFlashMessage(" Cart Items from cart",'succes')
      } else if (response.status === 409) {
         //console.log('Return DATA is :\n', data)
        showFlashMessage(msg, 'error')
         //console.log("Data", data.list_failed_purchases)
        for (let i = 0; i < dataItemsReturned.length; i++) {
          const returnedItem = dataItemsReturned[i].Item
          const msgItem = dataItemsReturned[i].msg
           //console.log("PRICE HAS CHANGED");
           //console.log('data is: ', returnedItem)
          displayNotification(`${returnedItem.id}-update_info`, msgItem)
          setCartItems((prevCartItems) =>
            prevCartItems.map((cartItem) =>
              cartItem.id === returnedItem.id
                ? {
                  ...cartItem,
                  added_item: {
                    ...cartItem.added_item,
                    price: returnedItem.price,
                  },
                }
                : cartItem
            )
          );
        }



      }
      else {
         //console.log("RESPONSE 400 ", response.status)
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
      if (response.ok) {
        showFlashMessage("Item deleted from cart", 'succes');
        setCartItems((prevCartItems) => {

          const updatedCartItems = prevCartItems.filter((item) => item.id !== itemId);
          const total = calculateTotalPrice(updatedCartItems);
          setTotalPriceCart(total);

          return updatedCartItems;
        });
        setItemCartCount(prevCount => prevCount - 1);
      } else {
        showFlashMessage("Erro occured", 'error')
      }
    }
    catch (error) {
      showFlashMessage(String(error), 'error')
       console.error('Error occured', error);
    }
  };


  const cardStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '10px',
    width: '80%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  };

  return (


    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', fontSize: "14px"
      }}>

        <div id="cartItems" style={{
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {flashMessage && (
            <FlashMessage
              message={flashMessage.message}
              type={flashMessage.type}
              onClose={closeFlashMessage}
            />
          )}
          {cartItems && cartItems.length > 0 && cartItems.map((item, index) => (
            <div
              // @ts-ignore
              style={cardStyle} id={`item_card_${item.id}`} key={`item_card_${item.id}`}>



              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: "25%", marginRight: '20px' }}>
                {item.img_url ? (
                  <img
                    src={item.img_url}
                    alt={item.title}
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
                    src={`${item.image}`}
                    alt={item.title}
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

              <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', width: "90%", height: '90%', marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: "row", alignItems: 'start', maxHeight: '20px' }}>
                  <div style={{ width: '90%', fontSize: "13px", margin: "5px 0px 0px 2px", display: 'flex', flexDirection: "column" }}>
                    <b>{item.title}</b>
                  </div>
                  <div style={{ display: 'flex', cursor: 'pointer', flexDirection: "column", alignItems: 'flex-end', }}>
                    <RiDeleteBin2Line size={15} key={item.id} onClick={() => deleteItem(item.id)} />
                  </div>
                </div>
                <div style={{
                  width: '90%',
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
                  {item.description}
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
                    <b>{item.price} €</b>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: "column",
                    alignItems: 'flex-end',
                    width: "48%",
                    fontSize: "10px"
                  }}>

                    {new Date(item.date_added).toISOString().split('T')[0]}

                  </div>

                </div>
                <div id={`${item.id}-update_info`} style={{
                  display: 'block',
                  borderRadius: '5px',
                  margin: '10px',
                  width: '80%',
                  backgroundColor: '#F84F31',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: "11px"
                }}>



                </div>
              </div>
            </div>))}



          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80%',
          }}>
            {cartItems && cartItems.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80%',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}> <b> TOTAL: {totalPriceCart} €</b> </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  <Button variant='success' style={{ width: '80%', marginBottom: "50px", marginTop: "20px" }} onClick={payItems}> Pay </Button>
                </div></div>) : (
              <div style={{
                marginTop: "50%", display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}> <img src="/images/empty-cart.png" style={{ height: "100%", width: "100%" }} /> </div>
            )}

          </div>

        </div>

      </div>
    </div>

  );
};


export default ContainerCart;
