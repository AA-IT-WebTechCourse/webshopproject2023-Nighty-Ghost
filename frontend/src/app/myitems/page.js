"use client";

import { BsSearch } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from "react";
import NvBar from '../../components/Navbar'
import UserMenuBar from "../../components/UserMenu";
import FlashMessage from '../../components/FlashMessage'
import ItemCard  from './../../components/ItemCard'

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

  const [isHoveredOnSaleFilter, setIsHoveredOnSaleFilter] = useState(false);
  const [isHoveredSoldFilter, setIsHoveredSoldFilter] = useState(false);
  const [isHoveredPurchasedFilter, setIsHoveredPurchasedFilter] = useState(false);

  const [isOnSaleFiltered, setIsOnSaleFiltered] = useState(true);
  const [isSoldFiltered, setIsSoldFiltered] = useState(false);
  const [isPurchasedFiltered, setIsPurchasedFiltered] = useState(false);

//CATEGORY HANDLING
const [items, setItems] = useState([]);
const [selectedCategory, setSelectedCategory] = useState(null);

useEffect(() => {
  fetchItems();
}, [selectedCategory]);

const fetchItems = async () => {
  try {
    let endpoint = '/api/my-items/';
    
    
    if (selectedCategory === 'onSale') {
      endpoint += '?is_sold=false';
    } else if (selectedCategory === 'sold') {
      endpoint += '?is_sold=true';
    } else if (selectedCategory === 'purchased') {
      
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include any necessary headers like Authorization
      },
    });

    if (response.ok) {
      const data = await response.json();
      setItems(data.items);
    } else {
      console.error('Failed to fetch items');
    }
  } catch (error) {
    console.error('Error fetching items:', error);
  }
};

const QueryItemsClick = (category) => {
  setSelectedCategory(category);
};

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
      cursor: 'pointer',
    },
    myItemsFilterMenu1: {
      backgroundColor: '#C0E410',
      cursor: 'pointer',
    },
    myItemsFilterMenu2: {
      backgroundColor: '#4F9E30',
      borderRadius: '0px 5px 5px 0px',
      cursor: 'pointer',
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

const editItemItem = async (itemId) => {
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

  const [itemsOnSale, setItemsOnSale] = useState([]);
  const [itemsSold, setItemsSold] = useState([]);

    useEffect(() => {
        checkAuth();
        const tokens = getToken();
  
        const fetchData = async () => {
  
          try {
              const response = await fetch("/api/my_items/", {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.access}`,
                  },
                
                });
  
              const data = await response.json();
              console.log(typeof data.items); // Using typeof for a quick check
              console.log(Object.keys(data.items).length);
              setItems(data.items.not_sold);
              console.log(data.items.not_sold)
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
  const displayContentItems = [];
  for (let i = 0; i < items.length; i += itemsPerColumn) {
    const columnItems = items.slice(i, i + itemsPerColumn);
    const columnCards = columnItems.map((item, index) => (
      <ItemCard key={item.id} item={item} itemFunction={addItem} />
    ));

    displayContentItems.push(<div style={{  
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
                    ...(isHoveredOnSaleFilter && myItemsFilterstyles.myItemsFilterMenuHover),
                  }}
                  onMouseEnter={() => setIsHoveredOnSaleFilter(true)}
                  onMouseLeave={() => setIsHoveredOnSaleFilter(false)}
                  onClick={() => QueryItemsClick('onSale')}
                >
                  On sale
                </div>
                <div
                  style={{
                    ...myItemsFilterstyles.myItemsFilterMenu,
                    ...myItemsFilterstyles.myItemsFilterMenu1,
                    ...(isHoveredSoldFilter && myItemsFilterstyles.myItemsFilterMenuHover),
                  }}
                  onMouseEnter={() => setIsHoveredSoldFilter(true)}
                  onMouseLeave={() => setIsHoveredSoldFilter(false)}
                  onClick={() => QueryItemsClick('Sold')}
                >
                  Sold
                </div>
                <div
                  style={{
                    ...myItemsFilterstyles.myItemsFilterMenu,
                    ...myItemsFilterstyles.myItemsFilterMenu2,
                    ...(isHoveredPurchasedFilter && myItemsFilterstyles.myItemsFilterMenuHover),
                  }}
                  onMouseEnter={() => setIsHoveredPurchasedFilter(true)}
                  onMouseLeave={() => setIsHoveredPurchasedFilter(false)}
                  onClick={() => QueryItemsClick('Purchased')}
                >
                  Purchased
                </div>
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
            {displayContentItems}

          </div>
            
</div>





  );
}
